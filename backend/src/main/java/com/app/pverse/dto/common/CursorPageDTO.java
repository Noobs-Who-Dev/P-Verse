package com.app.pverse.dto.common;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Response wrapper cho cursor-based pagination (infinite scroll)
 * Thay thế Page<T> để tránh COUNT query không cần thiết
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CursorPageDTO<T> {

    /**
     * Danh sách items của page hiện tại
     */
    private List<T> data;

    /**
     * Cursor để fetch page tiếp theo
     * null nếu đã hết data
     */
    private String nextCursor;

    /**
     * Flag cho biết có data tiếp theo không
     */
    private boolean hasNext;

    /**
     * Số items trong page hiện tại
     */
    private int size;

    /**
     * Factory method từ Slice
     */
    public static <T> CursorPageDTO<T> fromSlice(List<T> content, boolean hasNext) {
        return CursorPageDTO.<T>builder()
                .data(content)
                .hasNext(hasNext)
                .size(content.size())
                .nextCursor(null) // Implement cursor logic in service
                .build();
    }
}