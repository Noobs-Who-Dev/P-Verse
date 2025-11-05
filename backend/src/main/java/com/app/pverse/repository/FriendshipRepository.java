package com.app.pverse.repository;

import com.app.pverse.entity.Friendship;
import com.app.pverse.entity.Friendship.FriendshipStatus;
import com.app.pverse.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FriendshipRepository extends JpaRepository<Friendship, Long> {

    /**
     * Tìm friendship giữa 2 user (bất kể thứ tự)
     */
    @Query("SELECT f FROM Friendship f WHERE " +
           "(f.user.id = :userId1 AND f.friend.id = :userId2) OR " +
           "(f.user.id = :userId2 AND f.friend.id = :userId1)")
    Optional<Friendship> findByUserIds(@Param("userId1") Long userId1,
                                       @Param("userId2") Long userId2);

    /**
     * Lấy danh sách bạn bè của user (status = ACCEPTED)
     */
    @Query("SELECT CASE " +
           "WHEN f.user.id = :userId THEN f.friend " +
           "ELSE f.user END " +
           "FROM Friendship f " +
           "WHERE (f.user.id = :userId OR f.friend.id = :userId) " +
           "AND f.status = :status")
    List<User> findFriendsByUserIdAndStatus(@Param("userId") Long userId,
                                            @Param("status") FriendshipStatus status);

    /**
     * Lấy danh sách yêu cầu kết bạn đã gửi (outgoing requests)
     */
    @Query("SELECT f FROM Friendship f WHERE f.requester.id = :userId AND f.status = 'PENDING'")
    List<Friendship> findOutgoingRequests(@Param("userId") Long userId);

    /**
     * Lấy danh sách yêu cầu kết bạn nhận được (incoming requests)
     */
    @Query("SELECT f FROM Friendship f WHERE " +
           "(f.user.id = :userId OR f.friend.id = :userId) " +
           "AND f.requester.id != :userId " +
           "AND f.status = 'PENDING'")
    List<Friendship> findIncomingRequests(@Param("userId") Long userId);

    /**
     * Kiểm tra 2 user đã là bạn chưa
     */
    @Query("SELECT CASE WHEN COUNT(f) > 0 THEN true ELSE false END " +
           "FROM Friendship f WHERE " +
           "((f.user.id = :userId1 AND f.friend.id = :userId2) OR " +
           "(f.user.id = :userId2 AND f.friend.id = :userId1)) " +
           "AND f.status = 'ACCEPTED'")
    boolean areFriends(@Param("userId1") Long userId1, @Param("userId2") Long userId2);

    /**
     * Kiểm tra đã có friendship request giữa 2 user chưa (bất kể status)
     */
    @Query("SELECT CASE WHEN COUNT(f) > 0 THEN true ELSE false END " +
           "FROM Friendship f WHERE " +
           "(f.user.id = :userId1 AND f.friend.id = :userId2) OR " +
           "(f.user.id = :userId2 AND f.friend.id = :userId1)")
    boolean existsByUserIds(@Param("userId1") Long userId1, @Param("userId2") Long userId2);

    /**
     * Đếm số bạn bè của user
     */
    @Query("SELECT COUNT(f) FROM Friendship f WHERE " +
           "(f.user.id = :userId OR f.friend.id = :userId) " +
           "AND f.status = 'ACCEPTED'")
    long countFriends(@Param("userId") Long userId);
}

