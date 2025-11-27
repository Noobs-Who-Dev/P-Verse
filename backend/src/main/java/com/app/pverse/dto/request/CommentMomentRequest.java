package com.app.pverse.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO cho việc comment vào moment
 * Comment sẽ được gửi vào chat giữa 2 người
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CommentMomentRequest {

    @NotNull(message = "Moment ID is required")
    private Long momentId;

    @NotBlank(message = "Comment content is required")
    @Size(max = 500, message = "Comment must not exceed 500 characters")
    private String comment;
}

