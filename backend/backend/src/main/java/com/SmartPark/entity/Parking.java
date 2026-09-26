package com.SmartPark.entity;

import jakarta.persistence.*;
import java.util.List;

@Entity
@Table(name = "parking")
public class Parking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String location;
    private int totalSlots;
    private int availableSlots;
    private double pricePerHour;

    @OneToMany(mappedBy = "parking")
    private List<ParkingSlot> slots;

    public Parking() {
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getLocation() {
        return location;
    }

    public int getTotalSlots() {
        return totalSlots;
    }

    public int getAvailableSlots() {
        return availableSlots;
    }

    public double getPricePerHour() {
        return pricePerHour;
    }

    public List<ParkingSlot> getSlots() {
        return slots;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public void setTotalSlots(int totalSlots) {
        this.totalSlots = totalSlots;
    }

    public void setAvailableSlots(int availableSlots) {
        this.availableSlots = availableSlots;
    }

    public void setPricePerHour(double pricePerHour) {
        this.pricePerHour = pricePerHour;
    }

    public void setSlots(List<ParkingSlot> slots) {
        this.slots = slots;
    }
}