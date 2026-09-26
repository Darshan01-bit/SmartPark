package com.SmartPark.dto;

import java.time.LocalDateTime;

public class BookingResponse {

    private Long id;

    private LocalDateTime startTime;

    private LocalDateTime endTime;

    private String status;

    private Long parkingId;

    private String parkingName;

    private String parkingLocation;

    private Long slotId;

    private String slotNumber;

    public BookingResponse() {
    }

    public BookingResponse(
            Long id,
            LocalDateTime startTime,
            LocalDateTime endTime,
            String status,
            Long parkingId,
            String parkingName,
            String parkingLocation,
            Long slotId,
            String slotNumber) {

        this.id = id;
        this.startTime = startTime;
        this.endTime = endTime;
        this.status = status;
        this.parkingId = parkingId;
        this.parkingName = parkingName;
        this.parkingLocation = parkingLocation;
        this.slotId = slotId;
        this.slotNumber = slotNumber;
    }

    public Long getId() {
        return id;
    }

    public LocalDateTime getStartTime() {
        return startTime;
    }

    public LocalDateTime getEndTime() {
        return endTime;
    }

    public String getStatus() {
        return status;
    }

    public Long getParkingId() {
        return parkingId;
    }

    public String getParkingName() {
        return parkingName;
    }

    public String getParkingLocation() {
        return parkingLocation;
    }

    public Long getSlotId() {
        return slotId;
    }

    public String getSlotNumber() {
        return slotNumber;
    }
}