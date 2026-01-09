import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable, Subscription, of } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MonitoringService, AnimalPosition } from '../../services/monitoring.service';

interface DecodedPayload {
  rawPayload: string;
  hexPayload: string;
  decodedData: {
    header: number;
    batteryLevel: number;
    batteryVoltage: number;
    coordinates: {
      latitude: number;
      longitude: number;
    };
    temperature: number;
    statusFlags: number;
    timestamp: string;
  };
  analysis: {
    integrity: boolean;
    plausibility: boolean;
    consistency: boolean;
    diagnostics: string[];
  };
}

@Component({
  selector: 'app-payload-analyzer',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatTabsModule,
    MatTableModule
  ],
  templateUrl: './payload-analyzer.component.html',
  styleUrls: ['./payload-analyzer.component.css']
})
export class PayloadAnalyzerComponent implements OnInit, OnDestroy {
  selectedAnimal$: Observable<AnimalPosition | null>;
  decodedPayload: DecodedPayload | null = null;

  // Sample payload for demonstration
  samplePayload = '011d9000000309026a83f905c7433628695d116d';
  inputPayload = '';

  displayedColumns: string[] = ['field', 'hex', 'value', 'description'];

  private subscriptions: Subscription[] = [];

  constructor(private monitoringService: MonitoringService) {
    this.selectedAnimal$ = monitoringService.selectedAnimal$;
  }

  ngOnInit(): void {
    this.subscriptions.push(
      this.selectedAnimal$.subscribe(animal => {
        if (animal?.payload) {
          this.decodePayload(animal.payload);
        }
      })
    );

    // Load sample payload
    this.decodePayload(this.samplePayload);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  decodePayload(payload: string): void {
    try {
      this.decodedPayload = this.decodeLoRaPayload(payload);
    } catch (error) {
      console.error('Error decoding payload:', error);
      this.decodedPayload = null;
    }
  }

  private decodeLoRaPayload(hexPayload: string): DecodedPayload {
    // Remove any spaces and ensure even length
    const cleanHex = hexPayload.replace(/\s/g, '');
    if (cleanHex.length % 2 !== 0) {
      throw new Error('Invalid hex payload length');
    }

    // Convert hex to bytes
    const bytes = this.hexToBytes(cleanHex);

    // Decode based on typical LoRaWAN animal tracking payload structure
    const decoded: DecodedPayload = {
      rawPayload: hexPayload,
      hexPayload: cleanHex,
      decodedData: {
        header: bytes[0],
        batteryLevel: this.calculateBatteryLevel(bytes[1], bytes[2]),
        batteryVoltage: this.calculateBatteryVoltage(bytes[1], bytes[2]),
        coordinates: this.decodeCoordinates(bytes.slice(3, 9)),
        temperature: this.decodeTemperature(bytes[9], bytes[10]),
        statusFlags: bytes[11],
        timestamp: new Date().toISOString()
      },
      analysis: {
        integrity: this.checkIntegrity(bytes),
        plausibility: this.checkPlausibility(bytes),
        consistency: this.checkConsistency(bytes),
        diagnostics: this.generateDiagnostics(bytes)
      }
    };

    return decoded;
  }

  private hexToBytes(hex: string): number[] {
    const bytes: number[] = [];
    for (let i = 0; i < hex.length; i += 2) {
      bytes.push(parseInt(hex.substr(i, 2), 16));
    }
    return bytes;
  }

  private calculateBatteryLevel(byte1: number, byte2: number): number {
    const voltage = ((byte1 << 8) | byte2) / 1000; // mV to V
    // Simple battery percentage calculation (3.0V = 0%, 4.2V = 100%)
    const percentage = Math.min(100, Math.max(0, ((voltage - 3.0) / (4.2 - 3.0)) * 100));
    return Math.round(percentage);
  }

  private calculateBatteryVoltage(byte1: number, byte2: number): number {
    return ((byte1 << 8) | byte2) / 1000;
  }

  private decodeCoordinates(coordBytes: number[]): { latitude: number; longitude: number } {
    // Assuming 6 bytes: lat (3 bytes), lon (3 bytes)
    const latRaw = (coordBytes[0] << 16) | (coordBytes[1] << 8) | coordBytes[2];
    const lonRaw = (coordBytes[3] << 16) | (coordBytes[4] << 8) | coordBytes[5];

    // Convert from encoded format (adjust based on your encoding)
    const latitude = (latRaw / 1000000) - 90; // Example conversion
    const longitude = (lonRaw / 1000000) - 180; // Example conversion

    return { latitude, longitude };
  }

  private decodeTemperature(byte1: number, byte2: number): number {
    const tempRaw = (byte1 << 8) | byte2;
    return tempRaw / 100; // Assuming temperature in 0.01°C units
  }

  private checkIntegrity(bytes: number[]): boolean {
    // Basic integrity check - ensure minimum payload length
    return bytes.length >= 12;
  }

  private checkPlausibility(bytes: number[]): boolean {
    const batteryVoltage = this.calculateBatteryVoltage(bytes[1], bytes[2]);
    const temperature = this.decodeTemperature(bytes[9], bytes[10]);
    const coords = this.decodeCoordinates(bytes.slice(3, 9));

    // Check reasonable ranges
    return batteryVoltage >= 2.5 && batteryVoltage <= 4.5 &&
           temperature >= -40 && temperature <= 85 &&
           coords.latitude >= -90 && coords.latitude <= 90 &&
           coords.longitude >= -180 && coords.longitude <= 180;
  }

  private checkConsistency(bytes: number[]): boolean {
    // Check for consistent header and flags
    const header = bytes[0];
    return (header & 0x01) === 0x01; // Location Fixed header check
  }

  private generateDiagnostics(bytes: number[]): string[] {
    const diagnostics: string[] = [];

    if (bytes.length < 12) {
      diagnostics.push('Payload trop court - longueur minimale 12 octets requise');
    }

    const batteryVoltage = this.calculateBatteryVoltage(bytes[1], bytes[2]);
    if (batteryVoltage < 3.0) {
      diagnostics.push('Tension batterie faible - risque de défaillance');
    }

    const temperature = this.decodeTemperature(bytes[9], bytes[10]);
    if (temperature < -10 || temperature > 50) {
      diagnostics.push('Température hors plage normale');
    }

    return diagnostics;
  }

  getPayloadTableData(): any[] {
    if (!this.decodedPayload) return [];

    return [
      {
        field: 'Header',
        hex: '0x' + this.decodedPayload.decodedData.header.toString(16).padStart(2, '0'),
        value: this.decodedPayload.decodedData.header,
        description: 'Type de payload (Location Fixed)'
      },
      {
        field: 'Battery Level',
        hex: '0x' + ((this.decodedPayload.decodedData.batteryLevel * 1000) >>> 8).toString(16).padStart(2, '0') +
             ((this.decodedPayload.decodedData.batteryLevel * 1000) & 0xFF).toString(16).padStart(2, '0'),
        value: this.decodedPayload.decodedData.batteryLevel + '%',
        description: 'Niveau de batterie calculé'
      },
      {
        field: 'Battery Voltage',
        hex: 'N/A',
        value: this.decodedPayload.decodedData.batteryVoltage.toFixed(2) + 'V',
        description: 'Tension batterie mesurée'
      },
      {
        field: 'Latitude',
        hex: 'Coord bytes',
        value: this.decodedPayload.decodedData.coordinates.latitude.toFixed(6),
        description: 'Latitude GPS'
      },
      {
        field: 'Longitude',
        hex: 'Coord bytes',
        value: this.decodedPayload.decodedData.coordinates.longitude.toFixed(6),
        description: 'Longitude GPS'
      },
      {
        field: 'Temperature',
        hex: '0x' + this.decodedPayload.decodedData.temperature.toString(16).padStart(4, '0'),
        value: this.decodedPayload.decodedData.temperature + '°C',
        description: 'Température ambiante'
      },
      {
        field: 'Status Flags',
        hex: '0x' + this.decodedPayload.decodedData.statusFlags.toString(16).padStart(2, '0'),
        value: this.decodedPayload.decodedData.statusFlags,
        description: 'Flags d\'état (man_down, motion, etc.)'
      }
    ];
  }

  analyzeCustomPayload(): void {
    if (this.inputPayload.trim()) {
      this.decodePayload(this.inputPayload.trim());
    }
  }

  loadSamplePayload(): void {
    this.inputPayload = this.samplePayload;
    this.decodePayload(this.samplePayload);
  }

  getStatusIconClass(flags: number, mask: number): string {
    switch (mask) {
      case 1: // Man Down
        return (flags & mask) ? 'text-red-600' : 'text-green-600';
      case 2: // Motion
        return (flags & mask) ? 'text-green-600' : 'text-yellow-600';
      default:
        return 'text-gray-600';
    }
  }

  getStatusIcon(flags: number, mask: number): string {
    switch (mask) {
      case 1: // Man Down
        return (flags & mask) ? 'warning' : 'check_circle';
      case 2: // Motion
        return (flags & mask) ? 'directions_run' : 'access_time';
      default:
        return 'help';
    }
  }
}
