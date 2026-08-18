package com.contingentworkforce.service;

import com.contingentworkforce.dto.common.PageResponse;
import com.contingentworkforce.dto.timesheet.TimesheetRejectRequest;
import com.contingentworkforce.dto.timesheet.TimesheetRequest;
import com.contingentworkforce.dto.timesheet.TimesheetResponse;
import com.contingentworkforce.enums.TimesheetStatus;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;
import java.util.UUID;

public interface TimesheetService {
    TimesheetResponse createTimesheet(TimesheetRequest request);
    TimesheetResponse updateTimesheet(UUID id, TimesheetRequest request);
    TimesheetResponse getTimesheetById(UUID id);
    PageResponse<TimesheetResponse> getTimesheets(UUID contractorId, UUID vendorId, UUID projectId, TimesheetStatus status, LocalDate startDate, LocalDate endDate, Pageable pageable);
    TimesheetResponse submitTimesheet(UUID id);
    TimesheetResponse approveTimesheet(UUID id);
    TimesheetResponse rejectTimesheet(UUID id, TimesheetRejectRequest rejectRequest);
    void deleteTimesheet(UUID id);
}
