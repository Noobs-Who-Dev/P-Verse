package com.app.pverse.repository;

import com.app.pverse.entity.Conversation;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ConversationRepository extends JpaRepository<Conversation, Long> {

    /**
     * Tìm conversation giữa 2 user (bất kể thứ tự)
     */
    @Query("SELECT c FROM Conversation c WHERE " +
           "(c.user1.id = :userId1 AND c.user2.id = :userId2) OR " +
           "(c.user1.id = :userId2 AND c.user2.id = :userId1)")
    Optional<Conversation> findByUserIds(@Param("userId1") Long userId1,
                                        @Param("userId2") Long userId2);

    /**
     * Lấy tất cả conversations của user (phân trang, sắp xếp theo tin nhắn mới nhất)
     */
    @Query("SELECT c FROM Conversation c WHERE " +
           "c.user1.id = :userId OR c.user2.id = :userId " +
           "ORDER BY c.lastMessageAt DESC NULLS LAST")
    Page<Conversation> findByUserId(@Param("userId") Long userId, Pageable pageable);

    /**
     * Đếm số conversations của user
     */
    @Query("SELECT COUNT(c) FROM Conversation c WHERE " +
           "c.user1.id = :userId OR c.user2.id = :userId")
    long countByUserId(@Param("userId") Long userId);

    /**
     * Kiểm tra conversation giữa 2 user đã tồn tại chưa
     */
    @Query("SELECT CASE WHEN COUNT(c) > 0 THEN true ELSE false END " +
           "FROM Conversation c WHERE " +
           "(c.user1.id = :userId1 AND c.user2.id = :userId2) OR " +
           "(c.user1.id = :userId2 AND c.user2.id = :userId1)")
    boolean existsByUserIds(@Param("userId1") Long userId1, @Param("userId2") Long userId2);
}

