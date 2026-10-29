package com.agrisense.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.agrisense.backend.model.Farm;
import com.agrisense.backend.model.Farmer;

public interface FarmRepository extends JpaRepository<Farm, Long> {

    List<Farm> findByFarmer(Farmer farmer);
}