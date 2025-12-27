// Project Types and Dummy Data for Construction/Machinery Projects

export type ProjectType = 'construction' | 'machinery';

export type ProjectStatus = 'planning' | 'in-progress' | 'completed' | 'on-hold';

export interface Project {
  id: string;
  name: string;
  stateId: string;
  type: ProjectType;
  status: ProjectStatus;
  startDate: string;
  endDate?: string;
  budget: number;
  contractor: string;
  description: string;
  progress: number; // 0-100
  planned_progress?: number; // 0-100, expected progress at current time
}

// Dummy projects data for each Malaysian state
export const projects: Project[] = [
  // Johor
  {
    id: 'JHR-001',
    name: 'Johor Bahru Highway Expansion',
    stateId: 'johor',
    type: 'construction',
    status: 'in-progress',
    startDate: '2024-03-15',
    endDate: '2025-12-31',
    budget: 150000000,
    contractor: 'IJM Construction Sdn Bhd',
    description: 'Expansion of JB highway to 6 lanes from Skudai to Senai',
    progress: 45,
    planned_progress: 60 // 15% DELAYED - Significantly behind schedule
  },
  {
    id: 'JHR-002',
    name: 'Iskandar Puteri Industrial Crane Installation',
    stateId: 'johor',
    type: 'machinery',
    status: 'completed',
    startDate: '2024-01-10',
    endDate: '2024-08-20',
    budget: 8500000,
    contractor: 'KSB Machinery Sdn Bhd',
    description: 'Installation of 5 heavy-duty cranes at industrial zone',
    progress: 100,
    planned_progress: 95 // 5% AHEAD - Completed ahead of schedule
  },
  {
    id: 'JHR-003',
    name: 'Pasir Gudang Port Extension',
    stateId: 'johor',
    type: 'construction',
    status: 'planning',
    startDate: '2025-06-01',
    budget: 320000000,
    contractor: 'Gamuda Berhad',
    description: 'Extension of cargo terminal and new berth construction',
    progress: 0,
    planned_progress: 0 // ON TRACK - Planning phase
  },

  // Selangor
  {
    id: 'SGR-001',
    name: 'KLIA Aerotrain Track Renovation',
    stateId: 'selangor',
    type: 'construction',
    status: 'in-progress',
    startDate: '2024-05-01',
    endDate: '2025-04-30',
    budget: 45000000,
    contractor: 'MMC Corp Berhad',
    description: 'Complete renovation of aerotrain track and stations',
    progress: 60,
    planned_progress: 60 // ON TRACK - Exactly as planned
  },
  {
    id: 'SGR-002',
    name: 'Shah Alam Stadium Excavator Fleet',
    stateId: 'selangor',
    type: 'machinery',
    status: 'in-progress',
    startDate: '2024-07-15',
    endDate: '2024-12-31',
    budget: 12000000,
    contractor: 'Caterpillar Malaysia',
    description: 'Deployment of excavators for stadium renovation project',
    progress: 75,
    planned_progress: 70 // 5% AHEAD - Ahead of schedule
  },
  {
    id: 'SGR-003',
    name: 'Petaling Jaya Mixed Development',
    stateId: 'selangor',
    type: 'construction',
    status: 'in-progress',
    startDate: '2023-09-01',
    endDate: '2026-12-31',
    budget: 890000000,
    contractor: 'SP Setia Berhad',
    description: 'Mixed commercial and residential development in PJ',
    progress: 35,
    planned_progress: 38 // 3% SLIGHTLY BEHIND - Minor delay
  },
  {
    id: 'SGR-004',
    name: 'Klang Valley MRT Extension',
    stateId: 'selangor',
    type: 'construction',
    status: 'on-hold',
    startDate: '2024-01-15',
    budget: 2100000000,
    contractor: 'MRCB-George Kent JV',
    description: 'MRT line extension from Kajang to Semenyih',
    progress: 15,
    planned_progress: 45 // 30% DELAYED - Major delays due to hold
  },

  // Sabah
  {
    id: 'SBH-001',
    name: 'Kota Kinabalu Waterfront Development',
    stateId: 'sabah',
    type: 'construction',
    status: 'in-progress',
    startDate: '2024-02-01',
    endDate: '2026-02-01',
    budget: 420000000,
    contractor: 'Hap Seng Consolidated',
    description: 'Redevelopment of KK waterfront with promenade and commercial spaces',
    progress: 28,
    planned_progress: 35 // 7% DELAYED - Behind schedule
  },
  {
    id: 'SBH-002',
    name: 'Sandakan Port Crane Upgrade',
    stateId: 'sabah',
    type: 'machinery',
    status: 'completed',
    startDate: '2024-03-01',
    endDate: '2024-09-30',
    budget: 18000000,
    contractor: 'Liebherr Malaysia',
    description: 'Installation of new container handling cranes',
    progress: 100,
    planned_progress: 100 // ON TRACK - Completed as planned
  },
  {
    id: 'SBH-003',
    name: 'Pan Borneo Highway Sabah Section',
    stateId: 'sabah',
    type: 'construction',
    status: 'in-progress',
    startDate: '2022-06-15',
    endDate: '2027-12-31',
    budget: 12800000000,
    contractor: 'Borneo Highway PDP Consortium',
    description: 'Major highway connecting Sabah coastal towns',
    progress: 52,
    planned_progress: 48 // 4% AHEAD - Slightly ahead of schedule
  },

  // Sarawak
  {
    id: 'SWK-001',
    name: 'Kuching Sentral Transportation Hub',
    stateId: 'sarawak',
    type: 'construction',
    status: 'planning',
    startDate: '2025-03-01',
    budget: 280000000,
    contractor: 'Naim Holdings Berhad',
    description: 'Integrated transportation hub connecting bus and LRT',
    progress: 0,
    planned_progress: 0 // ON TRACK - Not started yet
  },
  {
    id: 'SWK-002',
    name: 'Bintulu LNG Plant Machinery Upgrade',
    stateId: 'sarawak',
    type: 'machinery',
    status: 'in-progress',
    startDate: '2024-04-01',
    endDate: '2025-06-30',
    budget: 95000000,
    contractor: 'Petronas Technical Services',
    description: 'Upgrade of compression and processing machinery',
    progress: 40,
    planned_progress: 50 // 10% DELAYED - Significantly behind
  },
  {
    id: 'SWK-003',
    name: 'Miri-Bintulu Coastal Road',
    stateId: 'sarawak',
    type: 'construction',
    status: 'in-progress',
    startDate: '2023-08-01',
    endDate: '2026-08-01',
    budget: 560000000,
    contractor: 'PPES Works Sdn Bhd',
    description: 'New coastal highway connecting Miri and Bintulu',
    progress: 38,
    planned_progress: 40 // 2% SLIGHTLY BEHIND - Minor delay
  },

  // Penang
  {
    id: 'PNG-001',
    name: 'Penang South Reclamation',
    stateId: 'penang',
    type: 'construction',
    status: 'in-progress',
    startDate: '2023-01-15',
    endDate: '2030-12-31',
    budget: 6000000000,
    contractor: 'SRS Consortium',
    description: 'Island A reclamation for PSR project',
    progress: 20
  },
  {
    id: 'PNG-002',
    name: 'Bayan Lepas Tunnel Equipment',
    stateId: 'penang',
    type: 'machinery',
    status: 'planning',
    startDate: '2025-01-01',
    budget: 450000000,
    contractor: 'Herrenknecht AG',
    description: 'Tunnel boring machines for undersea tunnel project',
    progress: 0
  },

  // Perak
  {
    id: 'PRK-001',
    name: 'Ipoh City Centre Revitalization',
    stateId: 'perak',
    type: 'construction',
    status: 'in-progress',
    startDate: '2024-06-01',
    endDate: '2026-06-01',
    budget: 180000000,
    contractor: 'Sunway Construction',
    description: 'Heritage area restoration and new commercial development',
    progress: 22
  },
  {
    id: 'PRK-002',
    name: 'Lumut Naval Base Expansion',
    stateId: 'perak',
    type: 'construction',
    status: 'on-hold',
    startDate: '2024-02-01',
    budget: 890000000,
    contractor: 'Boustead Holdings',
    description: 'Expansion of naval facilities and new dry dock',
    progress: 8
  },

  // Kedah
  {
    id: 'KDH-001',
    name: 'Langkawi Airport Terminal Extension',
    stateId: 'kedah',
    type: 'construction',
    status: 'completed',
    startDate: '2023-06-01',
    endDate: '2024-10-15',
    budget: 120000000,
    contractor: 'WCT Holdings',
    description: 'New international arrival terminal',
    progress: 100
  },
  {
    id: 'KDH-002',
    name: 'Kulim Hi-Tech Park Phase 4',
    stateId: 'kedah',
    type: 'construction',
    status: 'in-progress',
    startDate: '2024-01-01',
    endDate: '2026-12-31',
    budget: 340000000,
    contractor: 'Sime Darby Property',
    description: 'Industrial park expansion for semiconductor facilities',
    progress: 30
  },

  // Kelantan
  {
    id: 'KTN-001',
    name: 'Kota Bharu Flood Mitigation',
    stateId: 'kelantan',
    type: 'construction',
    status: 'in-progress',
    startDate: '2024-03-01',
    endDate: '2025-11-30',
    budget: 75000000,
    contractor: 'JKR Malaysia',
    description: 'Drainage improvement and retention ponds construction',
    progress: 55
  },
  {
    id: 'KTN-002',
    name: 'Pengkalan Chepa Industrial Machinery',
    stateId: 'kelantan',
    type: 'machinery',
    status: 'planning',
    startDate: '2025-04-01',
    budget: 15000000,
    contractor: 'Komatsu Malaysia',
    description: 'Heavy machinery for new industrial zone development',
    progress: 0
  },

  // Terengganu
  {
    id: 'TRG-001',
    name: 'Kuala Terengganu Drawbridge',
    stateId: 'terengganu',
    type: 'construction',
    status: 'completed',
    startDate: '2022-01-01',
    endDate: '2024-06-30',
    budget: 250000000,
    contractor: 'UEM Group',
    description: 'Iconic drawbridge connecting Kuala Terengganu',
    progress: 100
  },
  {
    id: 'TRG-002',
    name: 'Kemaman Petrochemical Plant Upgrade',
    stateId: 'terengganu',
    type: 'machinery',
    status: 'in-progress',
    startDate: '2024-05-01',
    endDate: '2025-08-31',
    budget: 180000000,
    contractor: 'Dialog Group',
    description: 'Modernization of refinery processing equipment',
    progress: 35
  },

  // Pahang
  {
    id: 'PHG-001',
    name: 'East Coast Rail Link Pahang Section',
    stateId: 'pahang',
    type: 'construction',
    status: 'in-progress',
    startDate: '2021-01-01',
    endDate: '2026-12-31',
    budget: 8500000000,
    contractor: 'China Communications Construction',
    description: 'High-speed rail construction through Pahang',
    progress: 65
  },
  {
    id: 'PHG-002',
    name: 'Kuantan Port Container Cranes',
    stateId: 'pahang',
    type: 'machinery',
    status: 'completed',
    startDate: '2024-02-01',
    endDate: '2024-08-31',
    budget: 45000000,
    contractor: 'ZPMC Shanghai',
    description: 'New ship-to-shore container cranes installation',
    progress: 100
  },

  // Negeri Sembilan
  {
    id: 'NS-001',
    name: 'Seremban City Centre Development',
    stateId: 'negerisembilan',
    type: 'construction',
    status: 'planning',
    startDate: '2025-07-01',
    budget: 220000000,
    contractor: 'Matrix Concepts',
    description: 'Integrated commercial and transit hub development',
    progress: 0
  },
  {
    id: 'NS-002',
    name: 'Port Dickson Beach Restoration',
    stateId: 'negerisembilan',
    type: 'construction',
    status: 'in-progress',
    startDate: '2024-04-01',
    endDate: '2025-03-31',
    budget: 35000000,
    contractor: 'Ahmad Zaki Resources',
    description: 'Beach erosion control and restoration works',
    progress: 50
  },

  // Melaka
  {
    id: 'MLK-001',
    name: 'Melaka Gateway Port',
    stateId: 'malacca',
    type: 'construction',
    status: 'on-hold',
    startDate: '2023-01-01',
    budget: 1800000000,
    contractor: 'KAJ Development',
    description: 'Deep-water port and maritime industrial park',
    progress: 12
  },
  {
    id: 'MLK-002',
    name: 'Ayer Keroh Highway Widening',
    stateId: 'malacca',
    type: 'construction',
    status: 'in-progress',
    startDate: '2024-08-01',
    endDate: '2025-12-31',
    budget: 95000000,
    contractor: 'IJM Construction',
    description: 'Highway expansion from 4 to 6 lanes',
    progress: 18
  },

  // Perlis
  {
    id: 'PLS-001',
    name: 'Padang Besar Border Complex',
    stateId: 'perlis',
    type: 'construction',
    status: 'in-progress',
    startDate: '2024-05-15',
    endDate: '2025-11-30',
    budget: 85000000,
    contractor: 'WCT Holdings',
    description: 'Modernization of Malaysia-Thailand border facilities',
    progress: 32
  },
  {
    id: 'PLS-002',
    name: 'Kangar Town Centre Revamp',
    stateId: 'perlis',
    type: 'construction',
    status: 'planning',
    startDate: '2025-09-01',
    budget: 45000000,
    contractor: 'Pending Tender',
    description: 'Urban renewal project for state capital',
    progress: 0
  },

  // Kuala Lumpur
  {
    id: 'KL-001',
    name: 'MRT3 Circle Line',
    stateId: 'kualalumpur',
    type: 'construction',
    status: 'in-progress',
    startDate: '2023-09-01',
    endDate: '2030-12-31',
    budget: 31000000000,
    contractor: 'MMC-Gamuda JV',
    description: 'Orbital MRT line connecting major hubs in KL',
    progress: 18
  },
  {
    id: 'KL-002',
    name: 'Merdeka 118 Final Phase',
    stateId: 'kualalumpur',
    type: 'construction',
    status: 'completed',
    startDate: '2019-01-01',
    endDate: '2024-02-28',
    budget: 5000000000,
    contractor: 'Samsung C&T',
    description: 'Completion of Malaysia\'s tallest building',
    progress: 100
  },
  {
    id: 'KL-003',
    name: 'Bukit Bintang City Centre',
    stateId: 'kualalumpur',
    type: 'construction',
    status: 'in-progress',
    startDate: '2022-06-01',
    endDate: '2027-12-31',
    budget: 8700000000,
    contractor: 'EcoWorld-Pavilion JV',
    description: 'Mixed development on former Pudu Prison site',
    progress: 45
  },

  // Putrajaya
  {
    id: 'PTJ-001',
    name: 'Precinct 15 Government Complex',
    stateId: 'putrajaya',
    type: 'construction',
    status: 'in-progress',
    startDate: '2024-01-15',
    endDate: '2026-06-30',
    budget: 450000000,
    contractor: 'Sunway Construction',
    description: 'New government office complex development',
    progress: 25
  },
  {
    id: 'PTJ-002',
    name: 'Putrajaya Lake Dredging',
    stateId: 'putrajaya',
    type: 'machinery',
    status: 'completed',
    startDate: '2024-03-01',
    endDate: '2024-09-30',
    budget: 28000000,
    contractor: 'Envitech Engineering',
    description: 'Lake maintenance and water quality improvement',
    progress: 100
  },

  // Labuan
  {
    id: 'LBN-001',
    name: 'Labuan Liberty Port Upgrade',
    stateId: 'labuan',
    type: 'construction',
    status: 'planning',
    startDate: '2025-04-01',
    budget: 180000000,
    contractor: 'Pending Tender',
    description: 'Port capacity expansion for oil & gas support',
    progress: 0
  },
  {
    id: 'LBN-002',
    name: 'Offshore Platform Support Vessels',
    stateId: 'labuan',
    type: 'machinery',
    status: 'in-progress',
    startDate: '2024-06-01',
    endDate: '2025-03-31',
    budget: 65000000,
    contractor: 'MISC Berhad',
    description: 'Deployment of new support vessels for offshore operations',
    progress: 55
  }
];

// Helper function to get projects by state ID
export function getProjectsByState(stateId: string): Project[] {
  return projects.filter(project => project.stateId === stateId);
}

// Helper function to get project count by state
export function getProjectCountByState(stateId: string): number {
  return projects.filter(project => project.stateId === stateId).length;
}

// Format budget as currency
export function formatBudget(amount: number): string {
  if (amount >= 1000000000) {
    return `RM ${(amount / 1000000000).toFixed(1)}B`;
  } else if (amount >= 1000000) {
    return `RM ${(amount / 1000000).toFixed(1)}M`;
  } else if (amount >= 1000) {
    return `RM ${(amount / 1000).toFixed(0)}K`;
  }
  return `RM ${amount}`;
}

// Get status color
export function getStatusColor(status: ProjectStatus): string {
  switch (status) {
    case 'completed': return '#10b981'; // green
    case 'in-progress': return '#f59e0b'; // amber
    case 'on-hold': return '#ef4444'; // red
    case 'planning': return '#6b7280'; // gray
    default: return '#6b7280';
  }
}

// Get type color
export function getTypeColor(type: ProjectType): string {
  switch (type) {
    case 'construction': return '#f97316'; // orange
    case 'machinery': return '#3b82f6'; // blue
    default: return '#6b7280';
  }
}
