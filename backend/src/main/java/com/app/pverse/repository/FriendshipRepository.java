package com.app.pverse.repository;

import com.app.pverse.entity.Friendship;
import com.app.pverse.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FriendshipRepository extends JpaRepository<Friendship, Long> {

    Optional<Friendship> findByUserAndFriend(User user, User friend);

    /**
     * Tìm friendship giữa 2 user (không quan tâm thứ tự)
     */
    @Query("SELECT f FROM Friendship f WHERE " +
            "(f.user.id = :userId1 AND f.friend.id = :userId2) OR " +
            "(f.user.id = :userId2 AND f.friend.id = :userId1)")
    Optional<Friendship> findFriendshipBetween(@Param("userId1") Long userId1,
                                               @Param("userId2") Long userId2);

    /**
     * Lấy danh sách bạn bè đã accepted
     * FIX: Sử dụng 2 query riêng biệt thay vì CASE WHEN
     */
    @Query("SELECT f.friend FROM Friendship f WHERE " +
            "f.user.id = :userId AND f.status = 'ACCEPTED'")
    List<User> findAcceptedFriendsAsUser(@Param("userId") Long userId);

    @Query("SELECT f.user FROM Friendship f WHERE " +
            "f.friend.id = :userId AND f.status = 'ACCEPTED'")
    List<User> findAcceptedFriendsAsFriend(@Param("userId") Long userId);

    /**
     * Lấy danh sách friend requests đã gửi (đang pending)
     */
    @Query("SELECT f.friend FROM Friendship f WHERE " +
            "f.user.id = :userId AND f.requester.id = :userId AND f.status = 'PENDING'")
    List<User> findSentRequestsAsUser(@Param("userId") Long userId);

    @Query("SELECT f.user FROM Friendship f WHERE " +
            "f.friend.id = :userId AND f.requester.id = :userId AND f.status = 'PENDING'")
    List<User> findSentRequestsAsFriend(@Param("userId") Long userId);

    /**
     * Lấy danh sách friend requests nhận được (đang pending)
     */
    @Query("SELECT f.friend FROM Friendship f WHERE " +
            "f.user.id = :userId AND f.requester.id != :userId AND f.status = 'PENDING'")
    List<User> findReceivedRequestsAsUser(@Param("userId") Long userId);

    @Query("SELECT f.user FROM Friendship f WHERE " +
            "f.friend.id = :userId AND f.requester.id != :userId AND f.status = 'PENDING'")
    List<User> findReceivedRequestsAsFriend(@Param("userId") Long userId);

    /**
     * Kiểm tra trạng thái bạn bè giữa 2 user
     */
    @Query("SELECT f.status FROM Friendship f WHERE " +
            "(f.user.id = :userId1 AND f.friend.id = :userId2) OR " +
            "(f.user.id = :userId2 AND f.friend.id = :userId1)")
    Optional<Friendship.FriendshipStatus> findStatusBetween(@Param("userId1") Long userId1,
                                                            @Param("userId2") Long userId2);

    /**
     * Kiểm tra user có phải là requester không
     */
    @Query("SELECT CASE WHEN f.requester.id = :userId THEN true ELSE false END " +
            "FROM Friendship f WHERE " +
            "((f.user.id = :userId1 AND f.friend.id = :userId2) OR " +
            "(f.user.id = :userId2 AND f.friend.id = :userId1))")
    Optional<Boolean> isRequester(@Param("userId1") Long userId1,
                                  @Param("userId2") Long userId2,
                                  @Param("userId") Long userId);

    /**
     * Đếm số lượng bạn bè (ACCEPTED) của user
     */
    @Query("SELECT COUNT(f) FROM Friendship f WHERE " +
            "(f.user.id = :userId OR f.friend.id = :userId) AND f.status = 'ACCEPTED'")
    Long countFriends(@Param("userId") Long userId);
}