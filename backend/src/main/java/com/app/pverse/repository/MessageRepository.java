package com.app.pverse.repository;

import com.app.pverse.entity.Message;
import com.app.pverse.entity.Message.MessageType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {

    /**
     * Lấy messages của conversation (phân trang, sắp xếp theo thời gian giảm dần)
     */
    Page<Message> findByConversationIdOrderByCreatedAtDesc(Long conversationId, Pageable pageable);

    /**
     * Lấy messages của conversation (sắp xếp theo thời gian tăng dần - cho chat UI)
     */
    Page<Message> findByConversationIdOrderByCreatedAtAsc(Long conversationId, Pageable pageable);

    /**
     * Lấy tin nhắn mới nhất của conversation
     */
    @Query("SELECT m FROM Message m WHERE m.conversation.id = :conversationId " +
           "ORDER BY m.createdAt DESC LIMIT 1")
    Message findLatestMessageByConversationId(@Param("conversationId") Long conversationId);

    /**
     * Đếm số tin nhắn chưa đọc trong conversation (không phải của sender)
     */
    @Query("SELECT COUNT(m) FROM Message m WHERE " +
           "m.conversation.id = :conversationId " +
           "AND m.sender.id != :userId " +
           "AND m.isRead = false")
    long countUnreadMessages(@Param("conversationId") Long conversationId,
                            @Param("userId") Long userId);

    /**
     * Đếm tổng số tin nhắn chưa đọc của user (trên tất cả conversations)
     */
    @Query("SELECT COUNT(m) FROM Message m WHERE " +
           "(m.conversation.user1.id = :userId OR m.conversation.user2.id = :userId) " +
           "AND m.sender.id != :userId " +
           "AND m.isRead = false")
    long countTotalUnreadMessages(@Param("userId") Long userId);

    /**
     * Đánh dấu tất cả tin nhắn trong conversation là đã đọc (trừ tin nhắn của sender)
     */
    @Modifying
    @Query("UPDATE Message m SET m.isRead = true WHERE " +
           "m.conversation.id = :conversationId " +
           "AND m.sender.id != :userId " +
           "AND m.isRead = false")
    int markAllAsRead(@Param("conversationId") Long conversationId,
                     @Param("userId") Long userId);

    /**
     * Lấy messages theo loại
     */
    List<Message> findByConversationIdAndMessageType(Long conversationId, MessageType messageType);

    /**
     * Lấy tất cả moment replies trong conversation
     */
    @Query("SELECT m FROM Message m WHERE " +
           "m.conversation.id = :conversationId " +
           "AND m.messageType = 'MOMENT_REPLY' " +
           "ORDER BY m.createdAt DESC")
    List<Message> findMomentRepliesByConversationId(@Param("conversationId") Long conversationId);

    /**
     * Đếm số messages trong conversation
     */
    long countByConversationId(Long conversationId);
}

