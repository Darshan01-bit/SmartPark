package com.SmartPark.controller;

import com.SmartPark.entity.ParkingSlot;
import com.SmartPark.repository.ParkingSlotRepository;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/slots")
@CrossOrigin(origins = "http://localhost:5173")
public class ParkingSlotController {

    private final ParkingSlotRepository repository;

    public ParkingSlotController(ParkingSlotRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<ParkingSlot> getAllSlots() {
        return repository.findAll();
    }

    @GetMapping("/parking/{parkingId}")
    public List<ParkingSlot> getSlotsByParking(
            @PathVariable Long parkingId) {

        return repository.findByParkingId(parkingId);
    }

    @GetMapping("/{id}")
    public ParkingSlot getSlot(@PathVariable Long id) {
        return repository.findById(id).orElse(null);
    }

    @PostMapping
    public ParkingSlot addSlot(@RequestBody ParkingSlot slot) {
        return repository.save(slot);
    }
}