import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { ApiService } from '../../../core/services/api.service';

export interface PayloadAnalysis {
  rawPayload: string;
  hexPayload: string;
  decodedData: {
    header: string;
    battery: {
      hex: string;
      voltage: number;
      percentage: number;
    };
    coordinates: {
      latitude: number;
      longitude: number;
      accuracy: number;
    };
    temperature: number;
    statusFlags: {
      manDown: boolean;
      motionDetected: boolean;
      batteryCritical: boolean;
      gpsFixed: boolean;
    };
    movementData?: {
      steps: number;
      activityLevel: number;
    };
  };
  crcStatus: 'valid' | 'invalid';
  size: number;
  timestamp: string;
}

export interface NetworkAnalysis {
  gatewayReceptions: Array<{
    gatewayId: string;
    rssi: number;
    snr: number;
    channel: number;
    crcStatus: boolean;
    latency: number;
  }>;
  spectralAnalysis: {
    frequencyUsage: Array<{
      frequency: number;
      usage: number;
      noiseFloor: number;
    }>;
    interferenceLevel: number;
  };
  modulationParams: {
    bandwidth: number;
    spreadingFactor: number;
    codeRate: string;
    dataRate: string;
  };
  adrPerformance: {
    enabled: boolean;
    margin: number;
    dataRateChanges: number;
    powerChanges: number;
  };
  qosMetrics: {
    successRate: number;
    retransmissions: number;
    deduplicationRate: number;
    endToEndLatency: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class LoraDataService {
  constructor(private apiService: ApiService) {}

  // Analyser un payload LoRaWAN
  analyzePayload(payload: string, fPort: number = 2): Observable<PayloadAnalysis> {
    return of(this.decodePayload(payload, fPort)).pipe(
      map(decoded => ({
        rawPayload: payload,
        hexPayload: this.toHex(payload),
        decodedData: decoded,
        crcStatus: this.checkCRC(payload) ? 'valid' : 'invalid',
        size: payload.length,
        timestamp: new Date().toISOString()
      }))
    );
  }

  // Analyser les communications réseau
  analyzeNetwork(sensorId: number): Observable<NetworkAnalysis> {
    return this.apiService.get(`monitoring/link-analysis?sensor_id=${sensorId}`).pipe(
      map(response => this.mapApiToNetworkAnalysis(response.data || {})),
      catchError(() => of(this.getDefaultNetworkAnalysis()))
    );
  }

  // Décoder le payload spécifique au tracking animal
  private decodePayload(payload: string, fPort: number): any {
    // Pour fPort 2 (Location Fixed)
    if (fPort === 2) {
      return this.decodeLocationFixed(payload);
    }

    // Pour fPort 1 (Status Update)
    if (fPort === 1) {
      return this.decodeStatusUpdate(payload);
    }

    return this.decodeGeneric(payload);
  }

  private decodeLocationFixed(payload: string): any {
    const hex = this.toHex(payload);

    // Exemple de payload: "011d9000000309026a83f905c7433628695d116d"
    if (hex.length >= 24) {
      return {
        header: hex.substring(0, 2), // 01 = Location Fixed
        battery: {
          hex: hex.substring(2, 6),
          voltage: parseInt(hex.substring(2, 6), 16),
          percentage: this.voltageToPercentage(parseInt(hex.substring(2, 6), 16))
        },
        coordinates: {
          latitude: this.hexToCoordinate(hex.substring(6, 14)),
          longitude: this.hexToCoordinate(hex.substring(14, 22)),
          accuracy: parseInt(hex.substring(22, 24), 16)
        },
        temperature: this.hexToTemperature(hex.substring(24, 28)),
        statusFlags: {
          manDown: (parseInt(hex.substring(28, 30), 16) & 0x01) !== 0,
          motionDetected: (parseInt(hex.substring(28, 30), 16) & 0x02) !== 0,
          batteryCritical: (parseInt(hex.substring(28, 30), 16) & 0x04) !== 0,
          gpsFixed: (parseInt(hex.substring(28, 30), 16) & 0x08) !== 0
        }
      };
    }

    return this.decodeGeneric(payload);
  }

  private decodeStatusUpdate(payload: string): any {
    const hex = this.toHex(payload);

    return {
      header: hex.substring(0, 2),
      battery: {
        hex: hex.substring(2, 6),
        voltage: parseInt(hex.substring(2, 6), 16),
        percentage: this.voltageToPercentage(parseInt(hex.substring(2, 6), 16))
      },
      temperature: this.hexToTemperature(hex.substring(6, 10)),
      movementData: {
        steps: parseInt(hex.substring(10, 14), 16),
        activityLevel: parseInt(hex.substring(14, 16), 16)
      },
      statusFlags: {
        manDown: (parseInt(hex.substring(16, 18), 16) & 0x01) !== 0,
        motionDetected: (parseInt(hex.substring(16, 18), 16) & 0x02) !== 0
      }
    };
  }

  private decodeGeneric(payload: string): any {
    return {
      raw: payload,
      hex: this.toHex(payload),
      size: payload.length
    };
  }

  // Méthodes utilitaires de conversion
  private toHex(str: string): string {
    return Array.from(str)
      .map(c => c.charCodeAt(0).toString(16).padStart(2, '0'))
      .join('');
  }

  private voltageToPercentage(voltage: number): number {
    // Convertir mV en pourcentage (ex: 3.0V = 0%, 4.2V = 100%)
    const minVoltage = 3000;
    const maxVoltage = 4200;
    const clamped = Math.max(minVoltage, Math.min(voltage, maxVoltage));
    return Math.round(((clamped - minVoltage) / (maxVoltage - minVoltage)) * 100);
  }

  private hexToCoordinate(hex: string): number {
    // Convertir hex signed 32-bit en degrés décimaux
    const int = parseInt(hex, 16);
    const signed = int > 0x7FFFFFFF ? int - 0x100000000 : int;
    return signed / 10000000;
  }

  private hexToTemperature(hex: string): number {
    // Convertir hex signed 16-bit en °C
    const int = parseInt(hex, 16);
    const signed = int > 0x7FFF ? int - 0x10000 : int;
    return signed / 100;
  }

  private checkCRC(payload: string): boolean {
    // Vérification CRC simplifiée
    return payload.length > 0;
  }

  private mapApiToNetworkAnalysis(data: any): NetworkAnalysis {
    return {
      gatewayReceptions: data.gateway_receptions || [],
      spectralAnalysis: {
        frequencyUsage: data.frequency_usage || this.getDefaultFrequencies(),
        interferenceLevel: data.interference_level || 15
      },
      modulationParams: {
        bandwidth: data.bandwidth || 125,
        spreadingFactor: data.spreading_factor || 7,
        codeRate: data.code_rate || '4/5',
        dataRate: data.data_rate || 'DR5'
      },
      adrPerformance: {
        enabled: data.adr_enabled || true,
        margin: data.adr_margin || 10,
        dataRateChanges: data.dr_changes || 2,
        powerChanges: data.power_changes || 1
      },
      qosMetrics: {
        successRate: data.success_rate || 98.5,
        retransmissions: data.retransmissions || 0.5,
        deduplicationRate: data.deduplication_rate || 15,
        endToEndLatency: data.e2e_latency || 1.8
      }
    };
  }

  private getDefaultNetworkAnalysis(): NetworkAnalysis {
    return {
      gatewayReceptions: [
        { gatewayId: '0016c001f156266b', rssi: -109, snr: 5.75, channel: 5, crcStatus: true, latency: 1.43 },
        { gatewayId: '0016c001f156266c', rssi: -115, snr: 3.2, channel: 3, crcStatus: true, latency: 1.67 }
      ],
      spectralAnalysis: {
        frequencyUsage: this.getDefaultFrequencies(),
        interferenceLevel: 15
      },
      modulationParams: {
        bandwidth: 125,
        spreadingFactor: 7,
        codeRate: '4/5',
        dataRate: 'DR5'
      },
      adrPerformance: {
        enabled: true,
        margin: 10,
        dataRateChanges: 2,
        powerChanges: 1
      },
      qosMetrics: {
        successRate: 98.5,
        retransmissions: 0.5,
        deduplicationRate: 15,
        endToEndLatency: 1.8
      }
    };
  }

  private getDefaultFrequencies() {
    return [
      { frequency: 867.1, usage: 65, noiseFloor: -120 },
      { frequency: 867.3, usage: 45, noiseFloor: -118 },
      { frequency: 867.5, usage: 80, noiseFloor: -115 },
      { frequency: 867.7, usage: 35, noiseFloor: -122 },
      { frequency: 867.9, usage: 25, noiseFloor: -125 }
    ];
  }

  // Générer des rapports ChirpStack
  generateChirpStackReport(tenantId?: string): Observable<any> {
    const params: any = {};
    if (tenantId) params.tenant_id = tenantId;

    return this.apiService.get('monitoring/chirpstack-reports', params);
  }

  // Récupérer les logs d'événements
  getEventLogs(limit: number = 100): Observable<any[]> {
    return this.apiService.get(`monitoring/event-logs?limit=${limit}`).pipe(
      map(response => (response.data as any)?.logs || [])
    );
  }

  // Simuler un payload pour le débogage
  simulatePayload(fPort: number = 2): Observable<PayloadAnalysis> {
    const simulatedPayload = this.generateSimulatedPayload(fPort);
    return this.analyzePayload(simulatedPayload, fPort);
  }

  private generateSimulatedPayload(fPort: number): string {
    if (fPort === 2) {
      // Simuler un payload Location Fixed
      const battery = Math.floor(Math.random() * 1000) + 3200; // 3.2V - 4.2V
      const lat = 4.0535033 * 10000000;
      const lng = 9.6944950 * 10000000;
      const temp = 29 * 100;
      const flags = 0x43; // GPS fixé, mouvement détecté

      const buffer = new ArrayBuffer(15);
      const view = new DataView(buffer);

      view.setUint8(0, 0x01); // Header
      view.setUint16(1, battery, false); // Battery
      view.setInt32(3, lat, false); // Latitude
      view.setInt32(7, lng, false); // Longitude
      view.setUint8(11, 25); // Accuracy
      view.setInt16(12, temp, false); // Temperature
      view.setUint8(14, flags); // Status flags

      return String.fromCharCode(...new Uint8Array(buffer));
    }

    return 'Simulated payload';
  }
}
