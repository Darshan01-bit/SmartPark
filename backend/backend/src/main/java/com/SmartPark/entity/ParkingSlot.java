package com.SmartPark.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

@Entity
@Table(name = "parking_slots")
public class ParkingSlot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String slotNumber;

    private String status;

    @JsonIgnore
    @ManyToOne
    @JoinColumn(name = "parking_id")
    private Parking parking;

    public ParkingSlot() {
    }

    public Long getId() {
        return id;
    }

    public String getSlotNumber() {
        return slotNumber;
    }

    public String getStatus() {
        return status;
    }

    public Parking getParking() {
        return parking;
    }

    public void setSlotNumber(String slotNumber) {
        this.slotNumber = slotNumber;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public void setParking(Parking parking) {
        this.parking = parking;
    }
}