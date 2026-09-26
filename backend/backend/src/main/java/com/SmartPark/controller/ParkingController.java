package com.SmartPark.controller;

import com.SmartPark.entity.Parking;
import com.SmartPark.repository.ParkingRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/parking")
@CrossOrigin(origins = "http://localhost:5173")
public class ParkingController {

    private final ParkingRepository repository;

    public ParkingController(ParkingRepository repository) {
        this.repository = repository;
    }

    // Get all parking locations
    @GetMapping
    public List<Parking> getAllParking() {
        return repository.findAll();
    }

    // Get parking by ID
    @GetMapping("/{id}")
    public Parking getParking(@PathVariable Long id) {
        return repository.findById(id).orElse(null);
    }

    // Add new parking
    @PostMapping
    public Parking addParking(@RequestBody Parking parking) {
        return repository.save(parking);
    }

    // Delete parking
    @DeleteMapping("/{id}")
    public void deleteParking(@PathVariable Long id) {
        repository.deleteById(id);
    }
}