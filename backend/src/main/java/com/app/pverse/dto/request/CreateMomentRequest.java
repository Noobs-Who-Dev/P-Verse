package com.app.pverse.dto.request;

import com.app.pverse.entity.Moment.Visibility;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO cho việc tạo Moment
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateMomentRequest {

    @Size(max = 2200, message = "Caption must not exceed 2200 characters")
    private String caption;

    @NotNull(message = "Visibility is required")
    private Visibility visibility;

    /**
     * Chỉ bắt buộc khi visibility = SPECIFIC_PERSON
     */
    private Long specificUserId;
}

