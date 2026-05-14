package com.tutorgpt.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class Citation {
    @JsonProperty("doc_name")
    private String docName;

    @JsonProperty("page_num")
    private int pageNum;

    @JsonProperty("chunk_index")
    private int chunkIndex;
}
