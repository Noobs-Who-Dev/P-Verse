package com.app.pverse.service;

import com.app.pverse.dto.response.user.UserSearchDTO;
import com.app.pverse.entity.Friendship;
import com.app.pverse.entity.User;
import com.app.pverse.repository.BlockedUserRepository;
import com.app.pverse.repository.FriendshipRepository;
import com.app.pverse.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
@RequiredArgsConstructor
@Slf4j
public class FriendService {

    private final UserRepository userRepository;
    private final FriendshipRepository friendshipRepository;
    private final BlockedUserRepository blockedUserRepository;

    private static final int DEFAULT_SEARCH_LIMIT = 20;

    /**
     * Tìm kiếm users theo keyword với trạng thái quan hệ bạn bè
     */
    @Transactional(readOnly = true)
    public List<UserSearchDTO> searchUsers(String keyword, Long viewerId) {
        log.info("Searching users with keyword: {} by viewer: {}", keyword, viewerId);

        // Validate viewer exists
        User viewer = userRepository.findById(viewerId)
                .orElseThrow(() -> new IllegalArgumentException("Viewer not found"));

        // Search users (đã loại trừ bản thân và blocked users trong query)
        List<User> searchResults = userRepository.searchUsers(
                keyword.trim(),
                viewerId,
                DEFAULT_SEARCH_LIMIT
        );

        // Map sang DTO với friendship status
        return searchResults.stream()
                .map(user -> {
                    UserSearchDTO.FriendshipStatusDto status =
                            determineFriendshipStatus(viewerId, user.getId());
                    return UserSearchDTO.fromEntity(user, status);
                })
                .collect(Collectors.toList());
    }

    /**
     * Xác định trạng thái quan hệ bạn bè giữa viewer và target user
     */
    private UserSearchDTO.FriendshipStatusDto determineFriendshipStatus(Long viewerId, Long targetUserId) {
        // Kiểm tra có bị block không
        if (blockedUserRepository.hasBlockedRelationship(viewerId, targetUserId)) {
            return UserSearchDTO.FriendshipStatusDto.BLOCKED;
        }

        // Kiểm tra friendship
        Optional<Friendship> friendship = friendshipRepository.findFriendshipBetween(viewerId, targetUserId);

        if (friendship.isEmpty()) {
            return UserSearchDTO.FriendshipStatusDto.STRANGER;
        }

        Friendship f = friendship.get();

        // Nếu đã accepted -> FRIEND
        if (f.getStatus() == Friendship.FriendshipStatus.ACCEPTED) {
            return UserSearchDTO.FriendshipStatusDto.FRIEND;
        }

        // Nếu pending -> kiểm tra ai là requester
        if (f.getStatus() == Friendship.FriendshipStatus.PENDING) {
            if (f.getRequester().getId().equals(viewerId)) {
                return UserSearchDTO.FriendshipStatusDto.PENDING_SENT;
            } else {
                return UserSearchDTO.FriendshipStatusDto.PENDING_RECEIVED;
            }
        }

        // Default: STRANGER
        return UserSearchDTO.FriendshipStatusDto.STRANGER;
    }

    /**
     * Gửi/Hủy lời mời kết bạn (Toggle friend request)
     * - Nếu STRANGER -> Tạo friend request (PENDING_SENT)
     * - Nếu PENDING_SENT -> Hủy friend request (STRANGER)
     * - Nếu PENDING_RECEIVED -> Accept friend request (FRIEND)
     */
    @Transactional
    public UserSearchDTO.FriendshipStatusDto toggleFriendRequest(Long viewerId, Long targetUserId) {
        log.info("Toggle friend request: viewer={}, target={}", viewerId, targetUserId);

        // Validate users exist
        User viewer = userRepository.findById(viewerId)
                .orElseThrow(() -> new IllegalArgumentException("Viewer not found"));
        User targetUser = userRepository.findById(targetUserId)
                .orElseThrow(() -> new IllegalArgumentException("Target user not found"));

        // Không thể kết bạn với chính mình
        if (viewerId.equals(targetUserId)) {
            throw new IllegalArgumentException("Cannot send friend request to yourself");
        }

        // Kiểm tra block
        if (blockedUserRepository.hasBlockedRelationship(viewerId, targetUserId)) {
            throw new IllegalStateException("Cannot send friend request to blocked user");
        }

        // Kiểm tra friendship hiện tại
        Optional<Friendship> existingFriendship =
                friendshipRepository.findFriendshipBetween(viewerId, targetUserId);

        if (existingFriendship.isEmpty()) {
            // Case 1: STRANGER -> Tạo friend request mới
            return createFriendRequest(viewer, targetUser);
        }

        Friendship friendship = existingFriendship.get();

        switch (friendship.getStatus()) {
            case PENDING:
                if (friendship.getRequester().getId().equals(viewerId)) {
                    // Case 2: PENDING_SENT -> Hủy friend request
                    return cancelFriendRequest(friendship);
                } else {
                    // Case 3: PENDING_RECEIVED -> Accept friend request
                    return acceptFriendRequest(friendship);
                }

            case ACCEPTED:
                // Đã là bạn -> không làm gì
                return UserSearchDTO.FriendshipStatusDto.FRIEND;

            case BLOCKED:
                throw new IllegalStateException("Cannot send friend request: " + friendship.getStatus());

            default:
                throw new IllegalStateException("Unknown friendship status: " + friendship.getStatus());
        }
    }

    /**
     * ✅ MỚI: Accept friend request (chỉ người nhận mới được accept)
     */
    @Transactional
    public UserSearchDTO.FriendshipStatusDto acceptFriendRequest(Long viewerId, Long requesterId) {
        log.info("Accept friend request: viewer={}, requester={}", viewerId, requesterId);

        // Validate users exist
        userRepository.findById(viewerId)
                .orElseThrow(() -> new IllegalArgumentException("Viewer not found"));
        userRepository.findById(requesterId)
                .orElseThrow(() -> new IllegalArgumentException("Requester not found"));

        // Tìm friendship
        Friendship friendship = friendshipRepository.findFriendshipBetween(viewerId, requesterId)
                .orElseThrow(() -> new IllegalArgumentException("Friend request not found"));

        // Kiểm tra status
        if (friendship.getStatus() != Friendship.FriendshipStatus.PENDING) {
            throw new IllegalStateException("Friend request is not pending");
        }

        // Kiểm tra viewer có phải là người nhận không
        if (friendship.getRequester().getId().equals(viewerId)) {
            throw new IllegalStateException("You cannot accept your own friend request");
        }

        // Accept
        friendship.setStatus(Friendship.FriendshipStatus.ACCEPTED);
        friendshipRepository.save(friendship);
        log.info("Accepted friend request: id={}", friendship.getId());

        return UserSearchDTO.FriendshipStatusDto.FRIEND;
    }

    /**
     * ✅ MỚI: Reject friend request (người nhận từ chối)
     */
    @Transactional
    public UserSearchDTO.FriendshipStatusDto rejectFriendRequest(Long viewerId, Long requesterId) {
        log.info("Reject friend request: viewer={}, requester={}", viewerId, requesterId);

        // Validate users exist
        userRepository.findById(viewerId)
                .orElseThrow(() -> new IllegalArgumentException("Viewer not found"));
        userRepository.findById(requesterId)
                .orElseThrow(() -> new IllegalArgumentException("Requester not found"));

        // Tìm friendship
        Friendship friendship = friendshipRepository.findFriendshipBetween(viewerId, requesterId)
                .orElseThrow(() -> new IllegalArgumentException("Friend request not found"));

        // Kiểm tra status
        if (friendship.getStatus() != Friendship.FriendshipStatus.PENDING) {
            throw new IllegalStateException("Friend request is not pending");
        }

        // Kiểm tra viewer có phải là người nhận không
        if (friendship.getRequester().getId().equals(viewerId)) {
            throw new IllegalStateException("You cannot reject your own friend request");
        }

        // Reject = xóa luôn (hoặc có thể set status = REJECTED nếu muốn lưu lịch sử)
        friendshipRepository.delete(friendship);
        log.info("Rejected friend request: id={}", friendship.getId());

        return UserSearchDTO.FriendshipStatusDto.STRANGER;
    }

    /**
     * Tạo friend request mới
     */
    private UserSearchDTO.FriendshipStatusDto createFriendRequest(User viewer, User targetUser) {
        // Đảm bảo userId < friendId
        User user = viewer.getId() < targetUser.getId() ? viewer : targetUser;
        User friend = viewer.getId() < targetUser.getId() ? targetUser : viewer;

        Friendship friendship = Friendship.builder()
                .user(user)
                .friend(friend)
                .requester(viewer)
                .status(Friendship.FriendshipStatus.PENDING)
                .build();

        friendshipRepository.save(friendship);
        log.info("Created friend request: {} -> {}", viewer.getUsername(), targetUser.getUsername());

        return UserSearchDTO.FriendshipStatusDto.PENDING_SENT;
    }

    /**
     * Hủy friend request (khi viewer là requester)
     */
    private UserSearchDTO.FriendshipStatusDto cancelFriendRequest(Friendship friendship) {
        friendshipRepository.delete(friendship);
        log.info("Cancelled friend request: id={}", friendship.getId());

        return UserSearchDTO.FriendshipStatusDto.STRANGER;
    }

    /**
     * Accept friend request (khi viewer là người nhận) - Private helper
     */
    private UserSearchDTO.FriendshipStatusDto acceptFriendRequest(Friendship friendship) {
        friendship.setStatus(Friendship.FriendshipStatus.ACCEPTED);
        friendshipRepository.save(friendship);
        log.info("Accepted friend request: id={}", friendship.getId());

        return UserSearchDTO.FriendshipStatusDto.FRIEND;
    }

    /**
     * Unfriend (xóa bạn bè)
     */
    @Transactional
    public void unfriend(Long viewerId, Long targetUserId) {
        log.info("Unfriend: viewer={}, target={}", viewerId, targetUserId);

        Friendship friendship = friendshipRepository.findFriendshipBetween(viewerId, targetUserId)
                .orElseThrow(() -> new IllegalArgumentException("Friendship not found"));

        if (friendship.getStatus() != Friendship.FriendshipStatus.ACCEPTED) {
            throw new IllegalStateException("Cannot unfriend: not in accepted status");
        }

        friendshipRepository.delete(friendship);
        log.info("Unfriended successfully");
    }

    /**
     * Lấy danh sách bạn bè
     */
    @Transactional(readOnly = true)
    public List<UserSearchDTO> getFriends(Long userId) {
        log.info("Getting friends list for user: {}", userId);

        // Query 1: userId là user (ID nhỏ hơn)
        List<User> friendsAsUser = friendshipRepository.findAcceptedFriendsAsUser(userId);

        // Query 2: userId là friend (ID lớn hơn)
        List<User> friendsAsFriend = friendshipRepository.findAcceptedFriendsAsFriend(userId);

        // Merge 2 danh sách
        List<User> allFriends = Stream.concat(
                friendsAsUser.stream(),
                friendsAsFriend.stream()
        ).collect(Collectors.toList());

        return allFriends.stream()
                .map(friend -> UserSearchDTO.fromEntity(
                        friend,
                        UserSearchDTO.FriendshipStatusDto.FRIEND
                ))
                .collect(Collectors.toList());
    }

    /**
     * Lấy danh sách friend requests đã nhận
     */
    @Transactional(readOnly = true)
    public List<UserSearchDTO> getReceivedRequests(Long userId) {
        log.info("Getting received friend requests for user: {}", userId);

        // Query 1: userId là user (ID nhỏ hơn)
        List<User> requestsAsUser = friendshipRepository.findReceivedRequestsAsUser(userId);

        // Query 2: userId là friend (ID lớn hơn)
        List<User> requestsAsFriend = friendshipRepository.findReceivedRequestsAsFriend(userId);

        // Merge 2 danh sách
        List<User> allRequesters = Stream.concat(
                requestsAsUser.stream(),
                requestsAsFriend.stream()
        ).collect(Collectors.toList());

        return allRequesters.stream()
                .map(requester -> UserSearchDTO.fromEntity(
                        requester,
                        UserSearchDTO.FriendshipStatusDto.PENDING_RECEIVED
                ))
                .collect(Collectors.toList());
    }

    /**
     * ✅ MỚI: Lấy danh sách friend requests đã gửi
     */
    @Transactional(readOnly = true)
    public List<UserSearchDTO> getSentRequests(Long userId) {
        log.info("Getting sent friend requests for user: {}", userId);

        // Query 1: userId là user (ID nhỏ hơn)
        List<User> sentAsUser = friendshipRepository.findSentRequestsAsUser(userId);

        // Query 2: userId là friend (ID lớn hơn)
        List<User> sentAsFriend = friendshipRepository.findSentRequestsAsFriend(userId);

        // Merge 2 danh sách
        List<User> allSent = Stream.concat(
                sentAsUser.stream(),
                sentAsFriend.stream()
        ).collect(Collectors.toList());

        return allSent.stream()
                .map(target -> UserSearchDTO.fromEntity(
                        target,
                        UserSearchDTO.FriendshipStatusDto.PENDING_SENT
                ))
                .collect(Collectors.toList());
    }
}