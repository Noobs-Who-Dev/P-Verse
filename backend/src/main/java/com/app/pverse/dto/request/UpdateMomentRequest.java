package com.app.pverse.dto.request;

import com.app.pverse.entity.Moment.Visibility;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.web.multipart.MultipartFile;

/**
 * Request DTO cho việc cập nhật Moment
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateMomentRequest {

    @Size(max = 2200, message = "Caption must not exceed 2200 characters")
    private String caption;

    private Visibility visibility;

    /**
     * Chỉ bắt buộc khi visibility = SPECIFIC_PERSON
     */
    private Long specificUserId;

    // Not in JSON, set by controller
    private MultipartFile image;
}
