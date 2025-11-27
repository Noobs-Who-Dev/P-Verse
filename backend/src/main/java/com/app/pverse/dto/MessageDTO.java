package com.app.pverse.dto;

import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
public class MessageDTO {

    // --- Dữ liệu chung ---
    private Long senderId;
    private Long receiverId;
    private String content;
    private String messageType; // text, image, moment_reply

    // --- Dữ liệu phản hồi ---
    private Long id;
    private Long conversationId;
    private Boolean isRead;
    private LocalDateTime createdAt;

    // --- Dữ liệu cho IMAGE ---
    private String imagePath;

    // --- Dữ liệu cho MOMENT_REPLY ---
    private Long repliedMomentId;
    private String repliedMomentImagePath;
    private String repliedMomentCaption;
    private Long repliedMomentOwnerId;

    /**
     * Hàm tiện ích: tạo DTO từ entity Message
     */
    public static MessageDTO fromEntity(com.app.pverse.entity.Message message) {
        if (message == null) return null;
        
        // Determine receiverId from conversation
        Long senderId = message.getSender().getId();
        Long receiverId;
        if (message.getConversation().getUser1().getId().equals(senderId)) {
            receiverId = message.getConversation().getUser2().getId();
        } else {
            receiverId = message.getConversation().getUser1().getId();
        }
        
        MessageDTO.MessageDTOBuilder builder = MessageDTO.builder()
                .id(message.getId())
                .conversationId(message.getConversation().getId())
                .senderId(senderId)
                .receiverId(receiverId)
                .content(message.getContent())
                .messageType(String.valueOf(message.getMessageType()))
                .isRead(message.getIsRead())
                .createdAt(message.getCreatedAt())
                .imagePath(message.getImagePath()); // Add imagePath for IMAGE messages

        // Add moment reply data if applicable
        if (message.getRepliedMoment() != null) {
            builder.repliedMomentId(message.getRepliedMoment().getId())
                   .repliedMomentImagePath(message.getRepliedMoment().getImagePath())
                   .repliedMomentCaption(message.getRepliedMoment().getCaption())
                   .repliedMomentOwnerId(message.getRepliedMoment().getUser().getId());
        }

        return builder.build();
    }
}
