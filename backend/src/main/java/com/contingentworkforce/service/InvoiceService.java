package com.contingentworkforce.service;

import com.contingentworkforce.dto.common.PageResponse;
import com.contingentworkforce.dto.invoice.InvoiceRejectRequest;
import com.contingentworkforce.dto.invoice.InvoiceRequest;
import com.contingentworkforce.dto.invoice.InvoiceResponse;
import com.contingentworkforce.enums.InvoiceStatus;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;
import java.util.UUID;

public interface InvoiceService {
    InvoiceResponse createInvoice(InvoiceRequest request);
    InvoiceResponse updateInvoice(UUID id, InvoiceRequest request);
    InvoiceResponse getInvoiceById(UUID id);
    PageResponse<InvoiceResponse> getInvoices(UUID vendorId, UUID projectId, InvoiceStatus status, LocalDate startDate, LocalDate endDate, Pageable pageable);
    InvoiceResponse submitInvoice(UUID id);
    InvoiceResponse approveInvoice(UUID id);
    InvoiceResponse rejectInvoice(UUID id, InvoiceRejectRequest rejectRequest);
    InvoiceResponse markPaid(UUID id);
    void deleteInvoice(UUID id);
}
