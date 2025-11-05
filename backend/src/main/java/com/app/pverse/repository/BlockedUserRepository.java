package com.app.pverse.repository;

import com.app.pverse.entity.BlockedUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BlockedUserRepository extends JpaRepository<BlockedUser, Long> {

    /**
     * Tìm blocked record giữa blocker và blocked
     */
    Optional<BlockedUser> findByBlockerIdAndBlockedId(Long blockerId, Long blockedId);

    /**
     * Lấy danh sách người mà user đã chặn
     */
    List<BlockedUser> findByBlockerId(Long blockerId);

    /**
     * Lấy danh sách người đã chặn user này
     */
    List<BlockedUser> findByBlockedId(Long blockedId);

    /**
     * Kiểm tra user1 có chặn user2 không
     */
    boolean existsByBlockerIdAndBlockedId(Long blockerId, Long blockedId);

    /**
     * Kiểm tra 2 user có chặn lẫn nhau không (một trong hai chiều)
     */
    @Query("SELECT CASE WHEN COUNT(b) > 0 THEN true ELSE false END " +
           "FROM BlockedUser b WHERE " +
           "(b.blocker.id = :userId1 AND b.blocked.id = :userId2) OR " +
           "(b.blocker.id = :userId2 AND b.blocked.id = :userId1)")
    boolean hasBlockedRelationship(@Param("userId1") Long userId1,
                                   @Param("userId2") Long userId2);

    /**
     * Xóa blocked relationship
     */
    void deleteByBlockerIdAndBlockedId(Long blockerId, Long blockedId);
}

