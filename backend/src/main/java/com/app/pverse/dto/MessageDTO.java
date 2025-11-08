package com.app.pverse.dto;

import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MessageDTO {

    // --- Dữ liệu chung ---
    private Long senderId;
    private Long receiverId;
    private String content;
    private String messageType; // text, image, moment_share

    // --- Dữ liệu phản hồi ---
    private Long id;
    private Long conversationId;
    private Boolean isRead;
    private LocalDateTime createdAt;

    /**
     * Hàm tiện ích: tạo DTO từ entity Message
     */
    public static MessageDTO fromEntity(com.app.pverse.entity.Message message) {
        if (message == null) return null;
        return MessageDTO.builder()
                .id(message.getId())
                .conversationId(message.getConversation().getId())
                .senderId(message.getSender().getId())
                .content(message.getContent())
                .messageType(String.valueOf(message.getMessageType()))
                .isRead(message.getIsRead())
                .createdAt(message.getCreatedAt())
                .build();
    }
}
