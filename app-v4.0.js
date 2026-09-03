(() => {;
  'use strict';
const IS_PUBLIC_PILOT =
  window.location.hostname === 'cedricbodet49-cpu.github.io' ||
  window.location.hostname.endsWith('.github.io');

const SERVER_BASE_URL =
  IS_PUBLIC_PILOT
    ? null
    : (
        window.location.port === '3000'
          ? window.location.origin
          : 'http://localhost:3000'
      );
  const VERSION = '4.0.0-S2.01-P4.1';
  const STORAGE_KEYS = {
    recents: 'foselev_v3_recent_machines',
    activeMachine: 'foselev_v3_active_machine',
    visits: 'foselev_v3_visits',
    controllerProfile: 'foselev_v3_controller_profile'
 ,
    activeVisitResume: 'foselev-vfg-active-visit-resume'
  };
const CLOUD_CFG = 'FOSELEV_VFG_cloud_v1';
const DELETED_KEY = 'FOSELEV_VFG_deleted_v1';

let cloud = null;
let cloudUser = null;
let syncInProgress = false;
let lastAutoSync = 0;
  const VFG_REFERENTIAL = {"version":"1.0.0-P1","sourceWorkbook":"FOSELEV_VFG_Tourelle_GM_MM-BRAS-NACELLE 14-8   12h.xlsx","sourceSheets":["porteur gm-mk-cb-cn","tourelle GM","tourelle MK","BRAS DE GRUE","NACELLE"],"rules":{"optionalDefaultStatus":"na","mandatoryDefaultStatus":"pending","naExcludedFromControlledTotal":true,"allowCustomPoints":true,"familyResolution":"GM dont modèle/désignation contient MK => MK; sinon catégorie GM/CB/CN","modules":{"GM":{"carrier":"required","equipment":"required"},"MK":{"carrier":"required","equipment":"required"},"CB":{"carrier":"selectable","equipment":"selectable"},"CN":{"carrier":"selectable","equipment":"selectable"}}},"families":{"GM":{"carrier":[{"id":"documentation","label":"Documentation et plaques","points":[{"id":"documentation-001","sourceNumber":1,"label":"Plaques constructeur","optional":false,"defaultStatus":"pending","photoRequired":true,"sourceComment":"photos obligatoire ou bouton NA","plateScope":"machine"},{"id":"documentation-002","sourceNumber":2,"label":"Numéro de série","optional":false,"defaultStatus":"pending","sourceComment":"i"},{"id":"documentation-003","sourceNumber":3,"label":"Carte grise","optional":false,"defaultStatus":"pending"},{"id":"documentation-004","sourceNumber":4,"label":"Carnet d’entretien","optional":false,"defaultStatus":"pending"},{"id":"documentation-005","sourceNumber":5,"label":"Documents réglementaires","optional":false,"defaultStatus":"pending"},{"id":"documentation-006","sourceNumber":6,"label":"Vue d’ensemble","optional":false,"defaultStatus":"pending","photoRequired":true,"sourceComment":"photos obligatoire ou bouton NA"}]},{"id":"structure","label":"Châssis / Structure","points":[{"id":"structure-001","sourceNumber":1,"label":"État général du châssis","optional":false,"defaultStatus":"pending"},{"id":"structure-002","sourceNumber":2,"label":"Soudures","optional":false,"defaultStatus":"pending"},{"id":"structure-003","sourceNumber":3,"label":"Fixations","optional":false,"defaultStatus":"pending"},{"id":"structure-004","sourceNumber":4,"label":"Corrosion","optional":false,"defaultStatus":"pending"},{"id":"structure-005","sourceNumber":5,"label":"Déformations","optional":false,"defaultStatus":"pending"},{"id":"structure-006","sourceNumber":6,"label":"Protections","optional":false,"defaultStatus":"pending"}]},{"id":"powertrain","label":"Moteur & Transmission","points":[{"id":"powertrain-001","sourceNumber":1,"label":"Niveau d’huile moteur","optional":false,"defaultStatus":"pending"},{"id":"powertrain-002","sourceNumber":2,"label":"Fuites moteur","optional":false,"defaultStatus":"pending"},{"id":"powertrain-003","sourceNumber":3,"label":"Courroies et tendeurs","optional":false,"defaultStatus":"pending"},{"id":"powertrain-004","sourceNumber":4,"label":"Circuit de refroidissement","optional":false,"defaultStatus":"pending"},{"id":"powertrain-005","sourceNumber":5,"label":"Filtration","optional":false,"defaultStatus":"pending"},{"id":"powertrain-006","sourceNumber":6,"label":"Échappement","optional":false,"defaultStatus":"pending"},{"id":"powertrain-007","sourceNumber":1,"label":"Absence fuite moyeux / ponts","optional":false,"defaultStatus":"pending"},{"id":"powertrain-008","sourceNumber":2,"label":"État suspensions","optional":false,"defaultStatus":"pending"},{"id":"powertrain-009","sourceNumber":3,"label":"Direction, rotules, vérins et modes de direction","optional":false,"defaultStatus":"pending"},{"id":"powertrain-010","sourceNumber":4,"label":"frein de parc","optional":false,"defaultStatus":"pending"},{"id":"powertrain-011","sourceNumber":5,"label":"Frein de service","optional":false,"defaultStatus":"pending","sourceComment":"bouton essaie dynamique O/N"}]},{"id":"stabilisers","label":"Stabilisateurs","points":[{"id":"stabilisers-001","sourceNumber":1,"label":"État structure stabilisateurs","optional":false,"defaultStatus":"pending"},{"id":"stabilisers-002","sourceNumber":2,"label":"Absence fissure poutres stabilisation","optional":false,"defaultStatus":"pending"},{"id":"stabilisers-003","sourceNumber":3,"label":"État vérins stabilisation","optional":false,"defaultStatus":"pending"},{"id":"stabilisers-004","sourceNumber":4,"label":"Absence fuite vérins / flexibles","optional":false,"defaultStatus":"pending"},{"id":"stabilisers-005","sourceNumber":5,"label":"État patins / semelles appui","optional":false,"defaultStatus":"pending"},{"id":"stabilisers-006","sourceNumber":6,"label":"Axes, bagues, goupilles présents et sécurisés","optional":false,"defaultStatus":"pending"},{"id":"stabilisers-007","sourceNumber":7,"label":"Sortie / rentrée stabilisateurs","optional":false,"defaultStatus":"pending"}]},{"id":"tyres","label":"Pneumatiques","points":[{"id":"tyres-001","sourceNumber":1,"label":"Usure","optional":false,"defaultStatus":"pending"},{"id":"tyres-002","sourceNumber":2,"label":"Pression","optional":false,"defaultStatus":"pending"},{"id":"tyres-003","sourceNumber":3,"label":"Flancs","optional":false,"defaultStatus":"pending"},{"id":"tyres-004","sourceNumber":4,"label":"Jantes","optional":false,"defaultStatus":"pending"},{"id":"tyres-005","sourceNumber":5,"label":"Écrous de roues","optional":false,"defaultStatus":"pending"},{"id":"tyres-006","sourceNumber":6,"label":"Valves","optional":false,"defaultStatus":"pending"}]},{"id":"lighting","label":"Éclairage","points":[{"id":"lighting-001","sourceNumber":1,"label":"Feux de route","optional":false,"defaultStatus":"pending"},{"id":"lighting-002","sourceNumber":2,"label":"Feux de position","optional":false,"defaultStatus":"pending"},{"id":"lighting-003","sourceNumber":3,"label":"Clignotants","optional":false,"defaultStatus":"pending"},{"id":"lighting-004","sourceNumber":4,"label":"Feux stop","optional":false,"defaultStatus":"pending"},{"id":"lighting-005","sourceNumber":5,"label":"Feux de recul","optional":false,"defaultStatus":"pending"},{"id":"lighting-006","sourceNumber":6,"label":"Feux de gabarit tourelle","optional":false,"defaultStatus":"pending"}]},{"id":"cab","label":"Cabine porteur","points":[{"id":"cab-001","sourceNumber":1,"label":"État cabine","optional":false,"defaultStatus":"pending"},{"id":"cab-002","sourceNumber":2,"label":"Siège","optional":false,"defaultStatus":"pending"},{"id":"cab-003","sourceNumber":3,"label":"Ceinture","optional":false,"defaultStatus":"pending"},{"id":"cab-004","sourceNumber":4,"label":"Rétroviseurs","optional":false,"defaultStatus":"pending"},{"id":"cab-005","sourceNumber":5,"label":"Essuie-glaces","optional":false,"defaultStatus":"pending"},{"id":"cab-006","sourceNumber":6,"label":"Tableau de bord","optional":false,"defaultStatus":"pending"},{"id":"cab-007","sourceNumber":7,"label":"Avertisseur sonore","optional":false,"defaultStatus":"pending"}]},{"id":"electrical","label":"Électricité porteur","points":[{"id":"electrical-001","sourceNumber":1,"label":"Batteries","optional":false,"defaultStatus":"pending"},{"id":"electrical-002","sourceNumber":2,"label":"Coupe-batterie","optional":false,"defaultStatus":"pending"},{"id":"electrical-003","sourceNumber":3,"label":"Faisceaux","optional":false,"defaultStatus":"pending"},{"id":"electrical-004","sourceNumber":4,"label":"Connecteurs","optional":false,"defaultStatus":"pending"},{"id":"electrical-005","sourceNumber":5,"label":"Fusibles","optional":false,"defaultStatus":"pending"},{"id":"electrical-006","sourceNumber":6,"label":"Alternateur","optional":false,"defaultStatus":"pending"},{"id":"electrical-007","sourceNumber":7,"label":"Démarreur","optional":false,"defaultStatus":"pending"}]},{"id":"hydraulic","label":"Hydraulique porteur","points":[{"id":"hydraulic-001","sourceNumber":1,"label":"Réservoir","optional":false,"defaultStatus":"pending"},{"id":"hydraulic-002","sourceNumber":2,"label":"Niveau d’huile","optional":false,"defaultStatus":"pending"},{"id":"hydraulic-003","sourceNumber":3,"label":"Pompes","optional":false,"defaultStatus":"pending"},{"id":"hydraulic-004","sourceNumber":4,"label":"Flexibles","optional":false,"defaultStatus":"pending"},{"id":"hydraulic-005","sourceNumber":5,"label":"Raccords","optional":false,"defaultStatus":"pending"},{"id":"hydraulic-006","sourceNumber":6,"label":"Distributeurs","optional":false,"defaultStatus":"pending"},{"id":"hydraulic-007","sourceNumber":7,"label":"Vérins","optional":false,"defaultStatus":"pending"},{"id":"hydraulic-008","sourceNumber":8,"label":"Fuites","optional":false,"defaultStatus":"pending"}]},{"id":"access","label":"Coffres / Accès","points":[{"id":"access-001","sourceNumber":1,"label":"Coffres","optional":false,"defaultStatus":"pending"},{"id":"access-002","sourceNumber":2,"label":"Capots","optional":false,"defaultStatus":"pending"},{"id":"access-003","sourceNumber":3,"label":"Échelles","optional":false,"defaultStatus":"pending"},{"id":"access-004","sourceNumber":4,"label":"Marchepieds","optional":false,"defaultStatus":"pending"},{"id":"access-005","sourceNumber":5,"label":"Poignées","optional":false,"defaultStatus":"pending"},{"id":"access-006","sourceNumber":6,"label":"Protections","optional":false,"defaultStatus":"pending"}]}],"upper":[{"id":"upperCab","label":"Cabine tourelle","points":[{"id":"upperCab-001","sourceNumber":1,"label":"État cabine","optional":false,"defaultStatus":"pending"},{"id":"upperCab-002","sourceNumber":2,"label":"Siège","optional":false,"defaultStatus":"pending"},{"id":"upperCab-003","sourceNumber":3,"label":"Ceinture","optional":false,"defaultStatus":"pending"},{"id":"upperCab-004","sourceNumber":4,"label":"Vitrages","optional":false,"defaultStatus":"pending"},{"id":"upperCab-005","sourceNumber":5,"label":"Essuie-glaces","optional":false,"defaultStatus":"pending"},{"id":"upperCab-006","sourceNumber":6,"label":"Commandes","optional":false,"defaultStatus":"pending"},{"id":"upperCab-007","sourceNumber":7,"label":"Écrans","optional":false,"defaultStatus":"pending"},{"id":"upperCab-008","sourceNumber":8,"label":"Climatisation","optional":false,"defaultStatus":"pending"}]},{"id":"cec","label":"CEC / Codes défaut","points":[{"id":"cec-001","sourceNumber":1,"label":"Codes défaut","optional":false,"defaultStatus":"pending"},{"id":"cec-002","sourceNumber":2,"label":"Écrans","optional":false,"defaultStatus":"pending"},{"id":"cec-003","sourceNumber":3,"label":"Alarmes","optional":false,"defaultStatus":"pending"},{"id":"cec-004","sourceNumber":4,"label":"Capteurs","optional":false,"defaultStatus":"pending"},{"id":"cec-005","sourceNumber":5,"label":"Paramètres","optional":false,"defaultStatus":"pending"},{"id":"cec-006","sourceNumber":6,"label":"Historique défauts","optional":false,"defaultStatus":"pending"}]},{"id":"boom","label":"Flèche","points":[{"id":"boom-001","sourceNumber":1,"label":"Structure de flèche","optional":false,"defaultStatus":"pending"},{"id":"boom-002","sourceNumber":2,"label":"Soudures","optional":false,"defaultStatus":"pending"},{"id":"boom-003","sourceNumber":3,"label":"Axes","optional":false,"defaultStatus":"pending"},{"id":"boom-004","sourceNumber":4,"label":"Patins","optional":false,"defaultStatus":"pending"},{"id":"boom-005","sourceNumber":5,"label":"Vérin de relevage","optional":false,"defaultStatus":"pending"},{"id":"boom-006","sourceNumber":6,"label":"Vérins de télescopage","optional":false,"defaultStatus":"pending"},{"id":"boom-007","sourceNumber":7,"label":"Flexibles","optional":false,"defaultStatus":"pending"},{"id":"boom-008","sourceNumber":8,"label":"Enrouleurs","optional":false,"defaultStatus":"pending"},{"id":"boom-009","sourceNumber":9,"label":"Tête de flèche","optional":false,"defaultStatus":"pending"},{"id":"boom-010","sourceNumber":10,"label":"Robot de flèche","optional":false,"defaultStatus":"pending"}]},{"id":"mainWinch","label":"Treuil principal","points":[{"id":"mainWinch-001","sourceNumber":1,"label":"Câble","optional":false,"defaultStatus":"pending"},{"id":"mainWinch-002","sourceNumber":2,"label":"Tambour","optional":false,"defaultStatus":"pending"},{"id":"mainWinch-003","sourceNumber":3,"label":"Réducteur","optional":false,"defaultStatus":"pending"},{"id":"mainWinch-004","sourceNumber":4,"label":"Frein","optional":false,"defaultStatus":"pending"},{"id":"mainWinch-005","sourceNumber":5,"label":"Fixations","optional":false,"defaultStatus":"pending"},{"id":"mainWinch-006","sourceNumber":6,"label":"Graissage","optional":false,"defaultStatus":"pending"},{"id":"mainWinch-007","sourceNumber":7,"label":"Enrouleur","optional":false,"defaultStatus":"pending"},{"id":"mainWinch-008","sourceNumber":8,"label":"Crochet","optional":false,"defaultStatus":"pending"}]},{"id":"auxWinch","label":"Treuil auxiliaire","points":[{"id":"auxWinch-001","sourceNumber":1,"label":"Câble","optional":true,"defaultStatus":"na"},{"id":"auxWinch-002","sourceNumber":2,"label":"Tambour","optional":true,"defaultStatus":"na"},{"id":"auxWinch-003","sourceNumber":3,"label":"Réducteur","optional":true,"defaultStatus":"na"},{"id":"auxWinch-004","sourceNumber":4,"label":"Frein","optional":true,"defaultStatus":"na"},{"id":"auxWinch-005","sourceNumber":5,"label":"Fixations","optional":true,"defaultStatus":"na"},{"id":"auxWinch-006","sourceNumber":6,"label":"Graissage","optional":true,"defaultStatus":"na"},{"id":"auxWinch-007","sourceNumber":7,"label":"Enrouleur","optional":true,"defaultStatus":"na"},{"id":"auxWinch-008","sourceNumber":8,"label":"Crochet","optional":true,"defaultStatus":"na"}]},{"id":"upperElectrical","label":"Électricité tourelle","points":[{"id":"upperElectrical-001","sourceNumber":1,"label":"Batteries","optional":false,"defaultStatus":"pending"},{"id":"upperElectrical-002","sourceNumber":2,"label":"Faisceaux","optional":false,"defaultStatus":"pending"},{"id":"upperElectrical-003","sourceNumber":3,"label":"Connecteurs","optional":false,"defaultStatus":"pending"},{"id":"upperElectrical-004","sourceNumber":4,"label":"Capteurs","optional":false,"defaultStatus":"pending"},{"id":"upperElectrical-005","sourceNumber":5,"label":"Boîtiers","optional":false,"defaultStatus":"pending"},{"id":"upperElectrical-006","sourceNumber":6,"label":"Mise à la masse","optional":false,"defaultStatus":"pending"}]},{"id":"workLights","label":"Éclairage de travail","points":[{"id":"workLights-001","sourceNumber":1,"label":"Projecteurs cabine","optional":false,"defaultStatus":"pending"},{"id":"workLights-002","sourceNumber":2,"label":"Projecteurs flèche","optional":false,"defaultStatus":"pending"},{"id":"workLights-003","sourceNumber":3,"label":"Projecteurs treuils","optional":false,"defaultStatus":"pending"},{"id":"workLights-004","sourceNumber":4,"label":"Projecteurs poutres","optional":false,"defaultStatus":"pending"}]},{"id":"counterweight","label":"Contrepoids","points":[{"id":"counterweight-001","sourceNumber":1,"label":"Éléments de contrepoids","optional":false,"defaultStatus":"pending"},{"id":"counterweight-002","sourceNumber":2,"label":"Verrouillages","optional":false,"defaultStatus":"pending"},{"id":"counterweight-003","sourceNumber":3,"label":"Axes","optional":false,"defaultStatus":"pending"},{"id":"counterweight-004","sourceNumber":4,"label":"Fixations","optional":false,"defaultStatus":"pending"},{"id":"counterweight-005","sourceNumber":5,"label":"Système de dépose","optional":false,"defaultStatus":"pending"}]},{"id":"slewRing","label":"Couronne d’orientation","points":[{"id":"slewRing-001","sourceNumber":1,"label":"Boulonnerie","optional":false,"defaultStatus":"pending"},{"id":"slewRing-002","sourceNumber":2,"label":"Graissage","optional":false,"defaultStatus":"pending"},{"id":"slewRing-003","sourceNumber":3,"label":"Jeu","optional":false,"defaultStatus":"pending"},{"id":"slewRing-004","sourceNumber":4,"label":"Dentures","optional":false,"defaultStatus":"pending"},{"id":"slewRing-005","sourceNumber":5,"label":"Pignon d’orientation","optional":false,"defaultStatus":"pending"},{"id":"slewRing-006","sourceNumber":6,"label":"Frein d’orientation","optional":false,"defaultStatus":"pending"}]},{"id":"upperHydraulic","label":"Hydraulique tourelle","points":[{"id":"upperHydraulic-001","sourceNumber":1,"label":"Réservoir","optional":false,"defaultStatus":"pending"},{"id":"upperHydraulic-002","sourceNumber":2,"label":"Pompes","optional":false,"defaultStatus":"pending"},{"id":"upperHydraulic-003","sourceNumber":3,"label":"Flexibles","optional":false,"defaultStatus":"pending"},{"id":"upperHydraulic-004","sourceNumber":4,"label":"Raccords","optional":false,"defaultStatus":"pending"},{"id":"upperHydraulic-005","sourceNumber":5,"label":"Distributeurs","optional":false,"defaultStatus":"pending"},{"id":"upperHydraulic-006","sourceNumber":6,"label":"Vérins","optional":false,"defaultStatus":"pending"},{"id":"upperHydraulic-007","sourceNumber":7,"label":"Fuites","optional":false,"defaultStatus":"pending"}]},{"id":"lmi","label":"Limiteur de charge","points":[{"id":"lmi-001","sourceNumber":1,"label":"Affichage","optional":false,"defaultStatus":"pending"},{"id":"lmi-002","sourceNumber":2,"label":"Capteurs","optional":false,"defaultStatus":"pending"},{"id":"lmi-003","sourceNumber":3,"label":"Limiteurs","optional":false,"defaultStatus":"pending"},{"id":"lmi-004","sourceNumber":4,"label":"Alarmes","optional":false,"defaultStatus":"pending"},{"id":"lmi-005","sourceNumber":5,"label":"Fin de course","optional":false,"defaultStatus":"pending"},{"id":"lmi-006","sourceNumber":6,"label":"Anémomètre","optional":false,"defaultStatus":"pending"}]},{"id":"engineUpper","label":"Moteur tourelle (si équipé)","points":[{"id":"engineUpper-001","sourceNumber":1,"label":"État général et propreté du moteur","optional":true,"defaultStatus":"na"},{"id":"engineUpper-002","sourceNumber":2,"label":"Niveau d’huile moteur","optional":true,"defaultStatus":"na"},{"id":"engineUpper-003","sourceNumber":3,"label":"Niveau et état du liquide de refroidissement","optional":true,"defaultStatus":"na"},{"id":"engineUpper-004","sourceNumber":4,"label":"Absence de fuite huile / carburant / liquide de refroidissement","optional":true,"defaultStatus":"na"},{"id":"engineUpper-005","sourceNumber":5,"label":"Courroies, durites et colliers","optional":true,"defaultStatus":"na"},{"id":"engineUpper-006","sourceNumber":6,"label":"Supports moteur et silentblocs","optional":true,"defaultStatus":"na"},{"id":"engineUpper-007","sourceNumber":7,"label":"Échappement et protections thermiques","optional":true,"defaultStatus":"na"},{"id":"engineUpper-008","sourceNumber":8,"label":"Démarrage, arrêt et stabilité du régime","optional":true,"defaultStatus":"na"},{"id":"engineUpper-009","sourceNumber":9,"label":"Alarmes et défauts moteur","optional":true,"defaultStatus":"na"},{"id":"engineUpper-010","sourceNumber":10,"label":"Refroidissement et ventilation du compartiment moteur","optional":true,"defaultStatus":"na"}]},{"id":"flyJib","label":"Option fléchette","points":[{"id":"flyJib-001","sourceNumber":1,"label":"Présence de la documentation / tableau de charge correspondant à la fléchette","optional":true,"defaultStatus":"na"},{"id":"flyJib-002","sourceNumber":2,"label":"Identification des éléments et conformité de la longueur montée","optional":true,"defaultStatus":"na"},{"id":"flyJib-003","sourceNumber":3,"label":"État général de l’adaptateur de tête de flèche","optional":true,"defaultStatus":"na"},{"id":"flyJib-004","sourceNumber":4,"label":"État général des éléments treillis","optional":true,"defaultStatus":"na"},{"id":"flyJib-005","sourceNumber":5,"label":"Membrures, diagonales et montants","optional":true,"defaultStatus":"na"},{"id":"flyJib-006","sourceNumber":6,"label":"Soudures et absence de fissure","optional":true,"defaultStatus":"na"},{"id":"flyJib-007","sourceNumber":7,"label":"Absence de déformation / choc","optional":true,"defaultStatus":"na"},{"id":"flyJib-008","sourceNumber":8,"label":"Corrosion et état de surface","optional":true,"defaultStatus":"na"},{"id":"flyJib-009","sourceNumber":9,"label":"Axes d’assemblage","optional":true,"defaultStatus":"na"},{"id":"flyJib-010","sourceNumber":10,"label":"Goupilles, clavettes et sécurités d’axes","optional":true,"defaultStatus":"na"},{"id":"flyJib-011","sourceNumber":11,"label":"Articulations / charnières de repliage si fléchette pliante","optional":true,"defaultStatus":"na"},{"id":"flyJib-012","sourceNumber":12,"label":"Butées et verrouillages de position","optional":true,"defaultStatus":"na"},{"id":"flyJib-013","sourceNumber":13,"label":"Tirants / haubans / barres de suspension","optional":true,"defaultStatus":"na"},{"id":"flyJib-014","sourceNumber":14,"label":"Points d’ancrage des tirants / haubans","optional":true,"defaultStatus":"na"},{"id":"flyJib-015","sourceNumber":15,"label":"Tête de fléchette","optional":true,"defaultStatus":"na"},{"id":"flyJib-016","sourceNumber":16,"label":"Réas et gorges","optional":true,"defaultStatus":"na"},{"id":"flyJib-017","sourceNumber":17,"label":"Guides-câble et protections","optional":true,"defaultStatus":"na"},{"id":"flyJib-018","sourceNumber":18,"label":"Rooster sheave / poulie additionnelle si équipée","optional":true,"defaultStatus":"na"},{"id":"flyJib-019","sourceNumber":19,"label":"Fléchette de montage / traverse crochet si équipée","optional":true,"defaultStatus":"na"},{"id":"flyJib-020","sourceNumber":20,"label":"Supports et verrouillages de transport","optional":true,"defaultStatus":"na"},{"id":"flyJib-021","sourceNumber":21,"label":"Dispositif d’aide au montage / déploiement","optional":true,"defaultStatus":"na"},{"id":"flyJib-022","sourceNumber":22,"label":"Vérin de réglage hydraulique d’inclinaison si équipé","optional":true,"defaultStatus":"na"},{"id":"flyJib-023","sourceNumber":23,"label":"Axes et articulations du vérin de réglage","optional":true,"defaultStatus":"na"},{"id":"flyJib-024","sourceNumber":24,"label":"Flexibles et raccords hydrauliques de la fléchette","optional":true,"defaultStatus":"na"},{"id":"flyJib-025","sourceNumber":25,"label":"Tambour / enrouleur de flexible si équipé","optional":true,"defaultStatus":"na"},{"id":"flyJib-026","sourceNumber":26,"label":"Absence de fuite sur le circuit de réglage","optional":true,"defaultStatus":"na"},{"id":"flyJib-027","sourceNumber":27,"label":"Capteur d’angle / position de fléchette si équipé","optional":true,"defaultStatus":"na"},{"id":"flyJib-028","sourceNumber":28,"label":"Affichage de l’angle / configuration dans LICCON","optional":true,"defaultStatus":"na"},{"id":"flyJib-029","sourceNumber":29,"label":"Sélection du tableau de charge correspondant","optional":true,"defaultStatus":"na"},{"id":"flyJib-030","sourceNumber":30,"label":"Fonctionnement des sécurités liées à la fléchette","optional":true,"defaultStatus":"na"},{"id":"flyJib-031","sourceNumber":31,"label":"Déploiement / repliage sans point dur ni interférence","optional":true,"defaultStatus":"na"},{"id":"flyJib-032","sourceNumber":32,"label":"Réglage d’inclinaison régulier si hydraulique","optional":true,"defaultStatus":"na"},{"id":"flyJib-033","sourceNumber":33,"label":"Essai fonctionnel sans charge","optional":true,"defaultStatus":"na"},{"id":"flyJib-034","sourceNumber":34,"label":"Absence de jeu anormal après montage","optional":true,"defaultStatus":"na"}]},{"id":"luffingJib","label":"Option volée variable","points":[{"id":"luffingJib-001","sourceNumber":1,"label":"Présence de la documentation / tableau de charge correspondant","optional":true,"defaultStatus":"na"},{"id":"luffingJib-002","sourceNumber":2,"label":"Identification de la configuration et de la longueur montée","optional":true,"defaultStatus":"na"},{"id":"luffingJib-003","sourceNumber":3,"label":"État de l’adaptateur de liaison à la flèche télescopique","optional":true,"defaultStatus":"na"},{"id":"luffingJib-004","sourceNumber":4,"label":"État général des éléments treillis de volée variable","optional":true,"defaultStatus":"na"},{"id":"luffingJib-005","sourceNumber":5,"label":"Membrures, diagonales et montants","optional":true,"defaultStatus":"na"},{"id":"luffingJib-006","sourceNumber":6,"label":"Soudures et absence de fissure","optional":true,"defaultStatus":"na"},{"id":"luffingJib-007","sourceNumber":7,"label":"Absence de déformation / choc","optional":true,"defaultStatus":"na"},{"id":"luffingJib-008","sourceNumber":8,"label":"Corrosion et état de surface","optional":true,"defaultStatus":"na"},{"id":"luffingJib-009","sourceNumber":9,"label":"Axes d’assemblage des éléments","optional":true,"defaultStatus":"na"},{"id":"luffingJib-010","sourceNumber":10,"label":"Goupilles, clavettes et sécurités d’axes","optional":true,"defaultStatus":"na"},{"id":"luffingJib-011","sourceNumber":11,"label":"Pied de volée variable et articulations","optional":true,"defaultStatus":"na"},{"id":"luffingJib-012","sourceNumber":12,"label":"Tête de volée variable","optional":true,"defaultStatus":"na"},{"id":"luffingJib-013","sourceNumber":13,"label":"Réas de tête et état des gorges","optional":true,"defaultStatus":"na"},{"id":"luffingJib-014","sourceNumber":14,"label":"Tirants / haubans / câbles de suspension","optional":true,"defaultStatus":"na"},{"id":"luffingJib-015","sourceNumber":15,"label":"Points d’ancrage et ferrures de haubanage","optional":true,"defaultStatus":"na"},{"id":"luffingJib-016","sourceNumber":16,"label":"Chevalet / dispositif de support de volée si équipé","optional":true,"defaultStatus":"na"},{"id":"luffingJib-017","sourceNumber":17,"label":"Articulations du système de relevage","optional":true,"defaultStatus":"na"},{"id":"luffingJib-018","sourceNumber":18,"label":"Treuil de réglage / relevage de la volée variable","optional":true,"defaultStatus":"na"},{"id":"luffingJib-019","sourceNumber":19,"label":"Tambour du treuil de réglage","optional":true,"defaultStatus":"na"},{"id":"luffingJib-020","sourceNumber":20,"label":"Réducteur du treuil de réglage","optional":true,"defaultStatus":"na"},{"id":"luffingJib-021","sourceNumber":21,"label":"Moteur hydraulique du treuil de réglage","optional":true,"defaultStatus":"na"},{"id":"luffingJib-022","sourceNumber":22,"label":"Frein du treuil de réglage","optional":true,"defaultStatus":"na"},{"id":"luffingJib-023","sourceNumber":23,"label":"Fixations du treuil de réglage","optional":true,"defaultStatus":"na"},{"id":"luffingJib-024","sourceNumber":24,"label":"Câble de réglage / relevage","optional":true,"defaultStatus":"na"},{"id":"luffingJib-025","sourceNumber":25,"label":"Ancrage du câble de réglage","optional":true,"defaultStatus":"na"},{"id":"luffingJib-026","sourceNumber":26,"label":"État du mouflage de réglage","optional":true,"defaultStatus":"na"},{"id":"luffingJib-027","sourceNumber":27,"label":"Poulies / réas du système de réglage","optional":true,"defaultStatus":"na"},{"id":"luffingJib-028","sourceNumber":28,"label":"Guides-câble et protections","optional":true,"defaultStatus":"na"},{"id":"luffingJib-029","sourceNumber":29,"label":"Enroulement correct du câble sur le tambour","optional":true,"defaultStatus":"na"},{"id":"luffingJib-030","sourceNumber":30,"label":"Flexibles et raccords hydrauliques associés","optional":true,"defaultStatus":"na"},{"id":"luffingJib-031","sourceNumber":31,"label":"Capteur d’angle de volée variable","optional":true,"defaultStatus":"na"},{"id":"luffingJib-032","sourceNumber":32,"label":"Capteurs de position / fins de course","optional":true,"defaultStatus":"na"},{"id":"luffingJib-033","sourceNumber":33,"label":"Câblage et connecteurs des capteurs","optional":true,"defaultStatus":"na"},{"id":"luffingJib-034","sourceNumber":34,"label":"Affichage de la configuration dans LICCON","optional":true,"defaultStatus":"na"},{"id":"luffingJib-035","sourceNumber":35,"label":"Affichage de l’angle de volée","optional":true,"defaultStatus":"na"},{"id":"luffingJib-036","sourceNumber":36,"label":"Sélection du tableau de charge correspondant","optional":true,"defaultStatus":"na"},{"id":"luffingJib-037","sourceNumber":37,"label":"Interpolation / prise en compte de la capacité lors du relevage","optional":true,"defaultStatus":"na"},{"id":"luffingJib-038","sourceNumber":38,"label":"Fonction d’érection automatique si équipée","optional":true,"defaultStatus":"na"},{"id":"luffingJib-039","sourceNumber":39,"label":"Commande du treuil de réglage par le système de contrôle","optional":true,"defaultStatus":"na"},{"id":"luffingJib-040","sourceNumber":40,"label":"Montée / descente régulière de la volée variable","optional":true,"defaultStatus":"na"},{"id":"luffingJib-041","sourceNumber":41,"label":"Maintien de la position / efficacité du frein","optional":true,"defaultStatus":"na"},{"id":"luffingJib-042","sourceNumber":42,"label":"Fonctionnement des alarmes et sécurités","optional":true,"defaultStatus":"na"},{"id":"luffingJib-043","sourceNumber":43,"label":"Arrêts / limites de mouvement","optional":true,"defaultStatus":"na"},{"id":"luffingJib-044","sourceNumber":44,"label":"Essai fonctionnel sans charge","optional":true,"defaultStatus":"na"},{"id":"luffingJib-045","sourceNumber":45,"label":"Absence de bruit, à-coup, fuite ou échauffement anormal","optional":true,"defaultStatus":"na"},{"id":"luffingJib-046","sourceNumber":46,"label":"Verrouillages et supports de transport après repliage / démontage","optional":true,"defaultStatus":"na"}]}],"upperLabel":"Tourelle"},"MK":{"carrier":[{"id":"documentation","label":"Documentation et plaques","points":[{"id":"documentation-001","sourceNumber":1,"label":"Plaques constructeur","optional":false,"defaultStatus":"pending","photoRequired":true,"sourceComment":"photos obligatoire ou bouton NA","plateScope":"machine"},{"id":"documentation-002","sourceNumber":2,"label":"Numéro de série","optional":false,"defaultStatus":"pending","sourceComment":"i"},{"id":"documentation-003","sourceNumber":3,"label":"Carte grise","optional":false,"defaultStatus":"pending"},{"id":"documentation-004","sourceNumber":4,"label":"Carnet d’entretien","optional":false,"defaultStatus":"pending"},{"id":"documentation-005","sourceNumber":5,"label":"Documents réglementaires","optional":false,"defaultStatus":"pending"},{"id":"documentation-006","sourceNumber":6,"label":"Vue d’ensemble","optional":false,"defaultStatus":"pending","photoRequired":true,"sourceComment":"photos obligatoire ou bouton NA"}]},{"id":"structure","label":"Châssis / Structure","points":[{"id":"structure-001","sourceNumber":1,"label":"État général du châssis","optional":false,"defaultStatus":"pending"},{"id":"structure-002","sourceNumber":2,"label":"Soudures","optional":false,"defaultStatus":"pending"},{"id":"structure-003","sourceNumber":3,"label":"Fixations","optional":false,"defaultStatus":"pending"},{"id":"structure-004","sourceNumber":4,"label":"Corrosion","optional":false,"defaultStatus":"pending"},{"id":"structure-005","sourceNumber":5,"label":"Déformations","optional":false,"defaultStatus":"pending"},{"id":"structure-006","sourceNumber":6,"label":"Protections","optional":false,"defaultStatus":"pending"}]},{"id":"powertrain","label":"Moteur & Transmission","points":[{"id":"powertrain-001","sourceNumber":1,"label":"Niveau d’huile moteur","optional":false,"defaultStatus":"pending"},{"id":"powertrain-002","sourceNumber":2,"label":"Fuites moteur","optional":false,"defaultStatus":"pending"},{"id":"powertrain-003","sourceNumber":3,"label":"Courroies et tendeurs","optional":false,"defaultStatus":"pending"},{"id":"powertrain-004","sourceNumber":4,"label":"Circuit de refroidissement","optional":false,"defaultStatus":"pending"},{"id":"powertrain-005","sourceNumber":5,"label":"Filtration","optional":false,"defaultStatus":"pending"},{"id":"powertrain-006","sourceNumber":6,"label":"Échappement","optional":false,"defaultStatus":"pending"},{"id":"powertrain-007","sourceNumber":1,"label":"Absence fuite moyeux / ponts","optional":false,"defaultStatus":"pending"},{"id":"powertrain-008","sourceNumber":2,"label":"État suspensions","optional":false,"defaultStatus":"pending"},{"id":"powertrain-009","sourceNumber":3,"label":"Direction, rotules, vérins et modes de direction","optional":false,"defaultStatus":"pending"},{"id":"powertrain-010","sourceNumber":4,"label":"frein de parc","optional":false,"defaultStatus":"pending"},{"id":"powertrain-011","sourceNumber":5,"label":"Frein de service","optional":false,"defaultStatus":"pending","sourceComment":"bouton essaie dynamique O/N"}]},{"id":"stabilisers","label":"Stabilisateurs","points":[{"id":"stabilisers-001","sourceNumber":1,"label":"État structure stabilisateurs","optional":false,"defaultStatus":"pending"},{"id":"stabilisers-002","sourceNumber":2,"label":"Absence fissure poutres stabilisation","optional":false,"defaultStatus":"pending"},{"id":"stabilisers-003","sourceNumber":3,"label":"État vérins stabilisation","optional":false,"defaultStatus":"pending"},{"id":"stabilisers-004","sourceNumber":4,"label":"Absence fuite vérins / flexibles","optional":false,"defaultStatus":"pending"},{"id":"stabilisers-005","sourceNumber":5,"label":"État patins / semelles appui","optional":false,"defaultStatus":"pending"},{"id":"stabilisers-006","sourceNumber":6,"label":"Axes, bagues, goupilles présents et sécurisés","optional":false,"defaultStatus":"pending"},{"id":"stabilisers-007","sourceNumber":7,"label":"Sortie / rentrée stabilisateurs","optional":false,"defaultStatus":"pending"}]},{"id":"tyres","label":"Pneumatiques","points":[{"id":"tyres-001","sourceNumber":1,"label":"Usure","optional":false,"defaultStatus":"pending"},{"id":"tyres-002","sourceNumber":2,"label":"Pression","optional":false,"defaultStatus":"pending"},{"id":"tyres-003","sourceNumber":3,"label":"Flancs","optional":false,"defaultStatus":"pending"},{"id":"tyres-004","sourceNumber":4,"label":"Jantes","optional":false,"defaultStatus":"pending"},{"id":"tyres-005","sourceNumber":5,"label":"Écrous de roues","optional":false,"defaultStatus":"pending"},{"id":"tyres-006","sourceNumber":6,"label":"Valves","optional":false,"defaultStatus":"pending"}]},{"id":"lighting","label":"Éclairage","points":[{"id":"lighting-001","sourceNumber":1,"label":"Feux de route","optional":false,"defaultStatus":"pending"},{"id":"lighting-002","sourceNumber":2,"label":"Feux de position","optional":false,"defaultStatus":"pending"},{"id":"lighting-003","sourceNumber":3,"label":"Clignotants","optional":false,"defaultStatus":"pending"},{"id":"lighting-004","sourceNumber":4,"label":"Feux stop","optional":false,"defaultStatus":"pending"},{"id":"lighting-005","sourceNumber":5,"label":"Feux de recul","optional":false,"defaultStatus":"pending"},{"id":"lighting-006","sourceNumber":6,"label":"Feux de gabarit tourelle","optional":false,"defaultStatus":"pending"}]},{"id":"cab","label":"Cabine porteur","points":[{"id":"cab-001","sourceNumber":1,"label":"État cabine","optional":false,"defaultStatus":"pending"},{"id":"cab-002","sourceNumber":2,"label":"Siège","optional":false,"defaultStatus":"pending"},{"id":"cab-003","sourceNumber":3,"label":"Ceinture","optional":false,"defaultStatus":"pending"},{"id":"cab-004","sourceNumber":4,"label":"Rétroviseurs","optional":false,"defaultStatus":"pending"},{"id":"cab-005","sourceNumber":5,"label":"Essuie-glaces","optional":false,"defaultStatus":"pending"},{"id":"cab-006","sourceNumber":6,"label":"Tableau de bord","optional":false,"defaultStatus":"pending"},{"id":"cab-007","sourceNumber":7,"label":"Avertisseur sonore","optional":false,"defaultStatus":"pending"}]},{"id":"electrical","label":"Électricité porteur","points":[{"id":"electrical-001","sourceNumber":1,"label":"Batteries","optional":false,"defaultStatus":"pending"},{"id":"electrical-002","sourceNumber":2,"label":"Coupe-batterie","optional":false,"defaultStatus":"pending"},{"id":"electrical-003","sourceNumber":3,"label":"Faisceaux","optional":false,"defaultStatus":"pending"},{"id":"electrical-004","sourceNumber":4,"label":"Connecteurs","optional":false,"defaultStatus":"pending"},{"id":"electrical-005","sourceNumber":5,"label":"Fusibles","optional":false,"defaultStatus":"pending"},{"id":"electrical-006","sourceNumber":6,"label":"Alternateur","optional":false,"defaultStatus":"pending"},{"id":"electrical-007","sourceNumber":7,"label":"Démarreur","optional":false,"defaultStatus":"pending"}]},{"id":"hydraulic","label":"Hydraulique porteur","points":[{"id":"hydraulic-001","sourceNumber":1,"label":"Réservoir","optional":false,"defaultStatus":"pending"},{"id":"hydraulic-002","sourceNumber":2,"label":"Niveau d’huile","optional":false,"defaultStatus":"pending"},{"id":"hydraulic-003","sourceNumber":3,"label":"Pompes","optional":false,"defaultStatus":"pending"},{"id":"hydraulic-004","sourceNumber":4,"label":"Flexibles","optional":false,"defaultStatus":"pending"},{"id":"hydraulic-005","sourceNumber":5,"label":"Raccords","optional":false,"defaultStatus":"pending"},{"id":"hydraulic-006","sourceNumber":6,"label":"Distributeurs","optional":false,"defaultStatus":"pending"},{"id":"hydraulic-007","sourceNumber":7,"label":"Vérins","optional":false,"defaultStatus":"pending"},{"id":"hydraulic-008","sourceNumber":8,"label":"Fuites","optional":false,"defaultStatus":"pending"}]},{"id":"access","label":"Coffres / Accès","points":[{"id":"access-001","sourceNumber":1,"label":"Coffres","optional":false,"defaultStatus":"pending"},{"id":"access-002","sourceNumber":2,"label":"Capots","optional":false,"defaultStatus":"pending"},{"id":"access-003","sourceNumber":3,"label":"Échelles","optional":false,"defaultStatus":"pending"},{"id":"access-004","sourceNumber":4,"label":"Marchepieds","optional":false,"defaultStatus":"pending"},{"id":"access-005","sourceNumber":5,"label":"Poignées","optional":false,"defaultStatus":"pending"},{"id":"access-006","sourceNumber":6,"label":"Protections","optional":false,"defaultStatus":"pending"}]}],"upper":[{"id":"structure-mat-tour-fleche","label":"Structure mât / tour / flèche","points":[{"id":"structure-mat-tour-fleche-001","sourceNumber":1,"label":"État général structure mât / tour","optional":false,"defaultStatus":"pending"},{"id":"structure-mat-tour-fleche-002","sourceNumber":2,"label":"Absence de fissure / déformation / choc","optional":false,"defaultStatus":"pending"},{"id":"structure-mat-tour-fleche-003","sourceNumber":3,"label":"Soudures","optional":false,"defaultStatus":"pending"},{"id":"structure-mat-tour-fleche-004","sourceNumber":4,"label":"Axes","optional":false,"defaultStatus":"pending"},{"id":"structure-mat-tour-fleche-005","sourceNumber":5,"label":"Bagues / jeux anormaux","optional":false,"defaultStatus":"pending"},{"id":"structure-mat-tour-fleche-006","sourceNumber":6,"label":"Verrouillages mécaniques","optional":false,"defaultStatus":"pending"},{"id":"structure-mat-tour-fleche-007","sourceNumber":7,"label":"Graissage des articulations","optional":false,"defaultStatus":"pending"},{"id":"structure-mat-tour-fleche-008","sourceNumber":8,"label":"État général de la flèche","optional":false,"defaultStatus":"pending"},{"id":"structure-mat-tour-fleche-009","sourceNumber":9,"label":"Tirants / haubans / renvois","optional":false,"defaultStatus":"pending"},{"id":"structure-mat-tour-fleche-010","sourceNumber":10,"label":"Galets / guidages","optional":false,"defaultStatus":"pending"},{"id":"structure-mat-tour-fleche-011","sourceNumber":11,"label":"Rails de chariot","optional":false,"defaultStatus":"pending"},{"id":"structure-mat-tour-fleche-012","sourceNumber":12,"label":"Câblage / chaînes porte-câbles","optional":false,"defaultStatus":"pending"}]},{"id":"orientation","label":"Orientation","points":[{"id":"orientation-001","sourceNumber":1,"label":"Boulonnerie de couronne","optional":false,"defaultStatus":"pending"},{"id":"orientation-002","sourceNumber":2,"label":"Graissage","optional":false,"defaultStatus":"pending"},{"id":"orientation-003","sourceNumber":3,"label":"Jeu","optional":false,"defaultStatus":"pending"},{"id":"orientation-004","sourceNumber":4,"label":"Dentures","optional":false,"defaultStatus":"pending"},{"id":"orientation-005","sourceNumber":5,"label":"Pignon / motoréducteur d’orientation","optional":false,"defaultStatus":"pending"},{"id":"orientation-006","sourceNumber":6,"label":"Frein d’orientation","optional":false,"defaultStatus":"pending"},{"id":"orientation-007","sourceNumber":7,"label":"Rotation gauche / droite","optional":false,"defaultStatus":"pending"},{"id":"orientation-008","sourceNumber":8,"label":"Progressivité de la commande","optional":false,"defaultStatus":"pending"},{"id":"orientation-009","sourceNumber":9,"label":"Limitation de zone si applicable","optional":true,"defaultStatus":"na"}]},{"id":"treuil-cable-crochet","label":"Treuil / câble / crochet","points":[{"id":"treuil-cable-crochet-001","sourceNumber":1,"label":"Câble","optional":false,"defaultStatus":"pending"},{"id":"treuil-cable-crochet-002","sourceNumber":2,"label":"Tambour","optional":false,"defaultStatus":"pending"},{"id":"treuil-cable-crochet-003","sourceNumber":3,"label":"Guide-câble","optional":false,"defaultStatus":"pending"},{"id":"treuil-cable-crochet-004","sourceNumber":4,"label":"Réducteur / motoréducteur","optional":false,"defaultStatus":"pending"},{"id":"treuil-cable-crochet-005","sourceNumber":5,"label":"Frein","optional":false,"defaultStatus":"pending"},{"id":"treuil-cable-crochet-006","sourceNumber":6,"label":"Fixations","optional":false,"defaultStatus":"pending"},{"id":"treuil-cable-crochet-007","sourceNumber":7,"label":"Graissage","optional":false,"defaultStatus":"pending"},{"id":"treuil-cable-crochet-008","sourceNumber":8,"label":"Enroulement du câble","optional":false,"defaultStatus":"pending"},{"id":"treuil-cable-crochet-009","sourceNumber":9,"label":"Poulies / réas / gorges","optional":false,"defaultStatus":"pending"},{"id":"treuil-cable-crochet-010","sourceNumber":10,"label":"Fixation extrémité câble","optional":false,"defaultStatus":"pending"},{"id":"treuil-cable-crochet-011","sourceNumber":11,"label":"Crochet","optional":false,"defaultStatus":"pending"},{"id":"treuil-cable-crochet-012","sourceNumber":12,"label":"Linguet de sécurité","optional":false,"defaultStatus":"pending"},{"id":"treuil-cable-crochet-013","sourceNumber":13,"label":"Rotation du crochet","optional":false,"defaultStatus":"pending"},{"id":"treuil-cable-crochet-014","sourceNumber":14,"label":"Marquage CMU","optional":false,"defaultStatus":"pending"},{"id":"treuil-cable-crochet-015","sourceNumber":15,"label":"État général moufle / accessoires de levage","optional":false,"defaultStatus":"pending"}]},{"id":"chariot-de-distribution","label":"Chariot de distribution","points":[{"id":"chariot-de-distribution-001","sourceNumber":1,"label":"Structure du chariot","optional":false,"defaultStatus":"pending"},{"id":"chariot-de-distribution-002","sourceNumber":2,"label":"Galets / roulements","optional":false,"defaultStatus":"pending"},{"id":"chariot-de-distribution-003","sourceNumber":3,"label":"Rails / guidages","optional":false,"defaultStatus":"pending"},{"id":"chariot-de-distribution-004","sourceNumber":4,"label":"Câble / chaîne de distribution","optional":false,"defaultStatus":"pending"},{"id":"chariot-de-distribution-005","sourceNumber":5,"label":"Motorisation","optional":false,"defaultStatus":"pending"},{"id":"chariot-de-distribution-006","sourceNumber":6,"label":"Frein","optional":false,"defaultStatus":"pending"},{"id":"chariot-de-distribution-007","sourceNumber":7,"label":"Fin de course avant","optional":false,"defaultStatus":"pending"},{"id":"chariot-de-distribution-008","sourceNumber":8,"label":"Fin de course arrière","optional":false,"defaultStatus":"pending"},{"id":"chariot-de-distribution-009","sourceNumber":9,"label":"Butées mécaniques","optional":false,"defaultStatus":"pending"},{"id":"chariot-de-distribution-010","sourceNumber":10,"label":"Déplacement avant / arrière et progressivité","optional":false,"defaultStatus":"pending"}]},{"id":"hydraulique","label":"Hydraulique","points":[{"id":"hydraulique-001","sourceNumber":1,"label":"Réservoir","optional":false,"defaultStatus":"pending"},{"id":"hydraulique-002","sourceNumber":2,"label":"Niveau d’huile","optional":false,"defaultStatus":"pending"},{"id":"hydraulique-003","sourceNumber":3,"label":"Pompes","optional":false,"defaultStatus":"pending"},{"id":"hydraulique-004","sourceNumber":4,"label":"Filtration","optional":false,"defaultStatus":"pending"},{"id":"hydraulique-005","sourceNumber":5,"label":"Flexibles","optional":false,"defaultStatus":"pending"},{"id":"hydraulique-006","sourceNumber":6,"label":"Raccords","optional":false,"defaultStatus":"pending"},{"id":"hydraulique-007","sourceNumber":7,"label":"Distributeurs","optional":false,"defaultStatus":"pending"},{"id":"hydraulique-008","sourceNumber":8,"label":"Vérins","optional":false,"defaultStatus":"pending"},{"id":"hydraulique-009","sourceNumber":9,"label":"Fuites","optional":false,"defaultStatus":"pending"}]},{"id":"electricite-commande","label":"Électricité / commande","points":[{"id":"electricite-commande-001","sourceNumber":1,"label":"Batteries","optional":false,"defaultStatus":"pending"},{"id":"electricite-commande-002","sourceNumber":2,"label":"Coupe-batterie","optional":false,"defaultStatus":"pending"},{"id":"electricite-commande-003","sourceNumber":3,"label":"Faisceaux","optional":false,"defaultStatus":"pending"},{"id":"electricite-commande-004","sourceNumber":4,"label":"Connecteurs","optional":false,"defaultStatus":"pending"},{"id":"electricite-commande-005","sourceNumber":5,"label":"Armoires / boîtiers électriques","optional":false,"defaultStatus":"pending"},{"id":"electricite-commande-006","sourceNumber":6,"label":"Capteurs / fins de course","optional":false,"defaultStatus":"pending"},{"id":"electricite-commande-007","sourceNumber":7,"label":"Pupitre de commande","optional":false,"defaultStatus":"pending"},{"id":"electricite-commande-008","sourceNumber":8,"label":"Écran / diagnostic","optional":false,"defaultStatus":"pending"},{"id":"electricite-commande-009","sourceNumber":9,"label":"Télécommande si équipée","optional":true,"defaultStatus":"na"},{"id":"electricite-commande-010","sourceNumber":10,"label":"Arrêts d’urgence","optional":false,"defaultStatus":"pending"},{"id":"electricite-commande-011","sourceNumber":11,"label":"Avertisseur sonore","optional":false,"defaultStatus":"pending"},{"id":"electricite-commande-012","sourceNumber":12,"label":"Éclairage de travail","optional":false,"defaultStatus":"pending"}]},{"id":"securites-grue","label":"Sécurités grue","points":[{"id":"securites-grue-001","sourceNumber":1,"label":"Limiteur de moment / charge","optional":false,"defaultStatus":"pending"},{"id":"securites-grue-002","sourceNumber":2,"label":"Affichage charge / portée","optional":false,"defaultStatus":"pending"},{"id":"securites-grue-003","sourceNumber":3,"label":"Fin de course haut crochet","optional":false,"defaultStatus":"pending"},{"id":"securites-grue-004","sourceNumber":4,"label":"Fin de course bas crochet","optional":false,"defaultStatus":"pending"},{"id":"securites-grue-005","sourceNumber":5,"label":"Fins de course chariot","optional":false,"defaultStatus":"pending"},{"id":"securites-grue-006","sourceNumber":6,"label":"Sécurité d’orientation","optional":false,"defaultStatus":"pending"},{"id":"securites-grue-007","sourceNumber":7,"label":"Sécurité de stabilisation","optional":false,"defaultStatus":"pending"},{"id":"securites-grue-008","sourceNumber":8,"label":"Anémomètre","optional":false,"defaultStatus":"pending"},{"id":"securites-grue-009","sourceNumber":9,"label":"Alarme surcharge","optional":false,"defaultStatus":"pending"},{"id":"securites-grue-010","sourceNumber":10,"label":"Coupure des mouvements dangereux en surcharge","optional":false,"defaultStatus":"pending"},{"id":"securites-grue-011","sourceNumber":11,"label":"Arrêts d’urgence fonctionnels","optional":false,"defaultStatus":"pending"},{"id":"securites-grue-012","sourceNumber":12,"label":"Verrouillages transport","optional":false,"defaultStatus":"pending"}]},{"id":"deploiement-repliement","label":"Déploiement / repliement","points":[{"id":"deploiement-repliement-001","sourceNumber":1,"label":"Séquence de déploiement","optional":false,"defaultStatus":"pending"},{"id":"deploiement-repliement-002","sourceNumber":2,"label":"Séquence de repliement","optional":false,"defaultStatus":"pending"},{"id":"deploiement-repliement-003","sourceNumber":3,"label":"Verrouillages de déploiement","optional":false,"defaultStatus":"pending"},{"id":"deploiement-repliement-004","sourceNumber":4,"label":"Capteurs de position","optional":false,"defaultStatus":"pending"},{"id":"deploiement-repliement-005","sourceNumber":5,"label":"Synchronisation des mouvements","optional":false,"defaultStatus":"pending"},{"id":"deploiement-repliement-006","sourceNumber":6,"label":"Absence d’interférence / collision","optional":false,"defaultStatus":"pending"},{"id":"deploiement-repliement-007","sourceNumber":7,"label":"Position travail correctement détectée","optional":false,"defaultStatus":"pending"},{"id":"deploiement-repliement-008","sourceNumber":8,"label":"Position transport correctement détectée","optional":false,"defaultStatus":"pending"}]},{"id":"essais-fonctionnels-sans-charge","label":"Essais fonctionnels sans charge","points":[{"id":"essais-fonctionnels-sans-charge-001","sourceNumber":1,"label":"Levage montée","optional":false,"defaultStatus":"pending"},{"id":"essais-fonctionnels-sans-charge-002","sourceNumber":2,"label":"Levage descente","optional":false,"defaultStatus":"pending"},{"id":"essais-fonctionnels-sans-charge-003","sourceNumber":3,"label":"Distribution chariot avant","optional":false,"defaultStatus":"pending"},{"id":"essais-fonctionnels-sans-charge-004","sourceNumber":4,"label":"Distribution chariot arrière","optional":false,"defaultStatus":"pending"},{"id":"essais-fonctionnels-sans-charge-005","sourceNumber":5,"label":"Orientation gauche","optional":false,"defaultStatus":"pending"},{"id":"essais-fonctionnels-sans-charge-006","sourceNumber":6,"label":"Orientation droite","optional":false,"defaultStatus":"pending"},{"id":"essais-fonctionnels-sans-charge-007","sourceNumber":7,"label":"Modes lents / rapides","optional":false,"defaultStatus":"pending"},{"id":"essais-fonctionnels-sans-charge-008","sourceNumber":8,"label":"Arrêt immédiat des mouvements","optional":false,"defaultStatus":"pending"},{"id":"essais-fonctionnels-sans-charge-009","sourceNumber":9,"label":"Fonctionnement des sécurités pendant les essais","optional":false,"defaultStatus":"pending"},{"id":"essais-fonctionnels-sans-charge-010","sourceNumber":10,"label":"Absence de bruit anormal","optional":false,"defaultStatus":"pending"},{"id":"essais-fonctionnels-sans-charge-011","sourceNumber":11,"label":"Absence d’échauffement anormal","optional":false,"defaultStatus":"pending"}]},{"id":"essais-avec-charge","label":"Essais avec charge","points":[{"id":"essais-avec-charge-001","sourceNumber":1,"label":"Levage avec charge","optional":false,"defaultStatus":"pending"},{"id":"essais-avec-charge-002","sourceNumber":2,"label":"Maintien de la charge suspendue","optional":false,"defaultStatus":"pending"},{"id":"essais-avec-charge-003","sourceNumber":3,"label":"Frein de levage","optional":false,"defaultStatus":"pending"},{"id":"essais-avec-charge-004","sourceNumber":4,"label":"Translation chariot avec charge","optional":false,"defaultStatus":"pending"},{"id":"essais-avec-charge-005","sourceNumber":5,"label":"Orientation avec charge","optional":false,"defaultStatus":"pending"},{"id":"essais-avec-charge-006","sourceNumber":6,"label":"Contrôle affichage charge / portée","optional":false,"defaultStatus":"pending"},{"id":"essais-avec-charge-007","sourceNumber":7,"label":"Contrôle limiteur de moment selon procédure applicable","optional":false,"defaultStatus":"pending"}]}],"upperLabel":"Grue MK"},"CB":{"carrier":[{"id":"documentation","label":"Documentation et plaques","points":[{"id":"documentation-001","sourceNumber":1,"label":"Plaques constructeur","optional":false,"defaultStatus":"pending","photoRequired":true,"sourceComment":"photos obligatoire ou bouton NA","plateScope":"chassis+equipment"},{"id":"documentation-002","sourceNumber":2,"label":"Numéro de série","optional":false,"defaultStatus":"pending","sourceComment":"i"},{"id":"documentation-003","sourceNumber":3,"label":"Carte grise","optional":false,"defaultStatus":"pending"},{"id":"documentation-004","sourceNumber":4,"label":"Carnet d’entretien","optional":false,"defaultStatus":"pending"},{"id":"documentation-005","sourceNumber":5,"label":"Documents réglementaires","optional":false,"defaultStatus":"pending"},{"id":"documentation-006","sourceNumber":6,"label":"Vue d’ensemble","optional":false,"defaultStatus":"pending","photoRequired":true,"sourceComment":"photos obligatoire ou bouton NA"}]},{"id":"structure","label":"Châssis / Structure","points":[{"id":"structure-001","sourceNumber":1,"label":"État général du châssis","optional":false,"defaultStatus":"pending"},{"id":"structure-002","sourceNumber":2,"label":"Soudures","optional":false,"defaultStatus":"pending"},{"id":"structure-003","sourceNumber":3,"label":"Fixations","optional":false,"defaultStatus":"pending"},{"id":"structure-004","sourceNumber":4,"label":"Corrosion","optional":false,"defaultStatus":"pending"},{"id":"structure-005","sourceNumber":5,"label":"Déformations","optional":false,"defaultStatus":"pending"},{"id":"structure-006","sourceNumber":6,"label":"Protections","optional":false,"defaultStatus":"pending"}]},{"id":"powertrain","label":"Moteur & Transmission","points":[{"id":"powertrain-001","sourceNumber":1,"label":"Niveau d’huile moteur","optional":false,"defaultStatus":"pending"},{"id":"powertrain-002","sourceNumber":2,"label":"Fuites moteur","optional":false,"defaultStatus":"pending"},{"id":"powertrain-003","sourceNumber":3,"label":"Courroies et tendeurs","optional":false,"defaultStatus":"pending"},{"id":"powertrain-004","sourceNumber":4,"label":"Circuit de refroidissement","optional":false,"defaultStatus":"pending"},{"id":"powertrain-005","sourceNumber":5,"label":"Filtration","optional":false,"defaultStatus":"pending"},{"id":"powertrain-006","sourceNumber":6,"label":"Échappement","optional":false,"defaultStatus":"pending"},{"id":"powertrain-007","sourceNumber":1,"label":"Absence fuite moyeux / ponts","optional":false,"defaultStatus":"pending"},{"id":"powertrain-008","sourceNumber":2,"label":"État suspensions","optional":false,"defaultStatus":"pending"},{"id":"powertrain-009","sourceNumber":3,"label":"Direction, rotules, vérins et modes de direction","optional":false,"defaultStatus":"pending"},{"id":"powertrain-010","sourceNumber":4,"label":"frein de parc","optional":false,"defaultStatus":"pending"},{"id":"powertrain-011","sourceNumber":5,"label":"Frein de service","optional":false,"defaultStatus":"pending","sourceComment":"bouton essaie dynamique O/N"}]},{"id":"stabilisers","label":"Stabilisateurs","points":[{"id":"stabilisers-001","sourceNumber":1,"label":"État structure stabilisateurs","optional":false,"defaultStatus":"pending"},{"id":"stabilisers-002","sourceNumber":2,"label":"Absence fissure poutres stabilisation","optional":false,"defaultStatus":"pending"},{"id":"stabilisers-003","sourceNumber":3,"label":"État vérins stabilisation","optional":false,"defaultStatus":"pending"},{"id":"stabilisers-004","sourceNumber":4,"label":"Absence fuite vérins / flexibles","optional":false,"defaultStatus":"pending"},{"id":"stabilisers-005","sourceNumber":5,"label":"État patins / semelles appui","optional":false,"defaultStatus":"pending"},{"id":"stabilisers-006","sourceNumber":6,"label":"Axes, bagues, goupilles présents et sécurisés","optional":false,"defaultStatus":"pending"},{"id":"stabilisers-007","sourceNumber":7,"label":"Sortie / rentrée stabilisateurs","optional":false,"defaultStatus":"pending"}]},{"id":"tyres","label":"Pneumatiques","points":[{"id":"tyres-001","sourceNumber":1,"label":"Usure","optional":false,"defaultStatus":"pending"},{"id":"tyres-002","sourceNumber":2,"label":"Pression","optional":false,"defaultStatus":"pending"},{"id":"tyres-003","sourceNumber":3,"label":"Flancs","optional":false,"defaultStatus":"pending"},{"id":"tyres-004","sourceNumber":4,"label":"Jantes","optional":false,"defaultStatus":"pending"},{"id":"tyres-005","sourceNumber":5,"label":"Écrous de roues","optional":false,"defaultStatus":"pending"},{"id":"tyres-006","sourceNumber":6,"label":"Valves","optional":false,"defaultStatus":"pending"}]},{"id":"lighting","label":"Éclairage","points":[{"id":"lighting-001","sourceNumber":1,"label":"Feux de route","optional":false,"defaultStatus":"pending"},{"id":"lighting-002","sourceNumber":2,"label":"Feux de position","optional":false,"defaultStatus":"pending"},{"id":"lighting-003","sourceNumber":3,"label":"Clignotants","optional":false,"defaultStatus":"pending"},{"id":"lighting-004","sourceNumber":4,"label":"Feux stop","optional":false,"defaultStatus":"pending"},{"id":"lighting-005","sourceNumber":5,"label":"Feux de recul","optional":false,"defaultStatus":"pending"},{"id":"lighting-006","sourceNumber":6,"label":"Feux de gabarit tourelle","optional":false,"defaultStatus":"pending"}]},{"id":"cab","label":"Cabine porteur","points":[{"id":"cab-001","sourceNumber":1,"label":"État cabine","optional":false,"defaultStatus":"pending"},{"id":"cab-002","sourceNumber":2,"label":"Siège","optional":false,"defaultStatus":"pending"},{"id":"cab-003","sourceNumber":3,"label":"Ceinture","optional":false,"defaultStatus":"pending"},{"id":"cab-004","sourceNumber":4,"label":"Rétroviseurs","optional":false,"defaultStatus":"pending"},{"id":"cab-005","sourceNumber":5,"label":"Essuie-glaces","optional":false,"defaultStatus":"pending"},{"id":"cab-006","sourceNumber":6,"label":"Tableau de bord","optional":false,"defaultStatus":"pending"},{"id":"cab-007","sourceNumber":7,"label":"Avertisseur sonore","optional":false,"defaultStatus":"pending"}]},{"id":"electrical","label":"Électricité porteur","points":[{"id":"electrical-001","sourceNumber":1,"label":"Batteries","optional":false,"defaultStatus":"pending"},{"id":"electrical-002","sourceNumber":2,"label":"Coupe-batterie","optional":false,"defaultStatus":"pending"},{"id":"electrical-003","sourceNumber":3,"label":"Faisceaux","optional":false,"defaultStatus":"pending"},{"id":"electrical-004","sourceNumber":4,"label":"Connecteurs","optional":false,"defaultStatus":"pending"},{"id":"electrical-005","sourceNumber":5,"label":"Fusibles","optional":false,"defaultStatus":"pending"},{"id":"electrical-006","sourceNumber":6,"label":"Alternateur","optional":false,"defaultStatus":"pending"},{"id":"electrical-007","sourceNumber":7,"label":"Démarreur","optional":false,"defaultStatus":"pending"}]},{"id":"hydraulic","label":"Hydraulique porteur","points":[{"id":"hydraulic-001","sourceNumber":1,"label":"Réservoir","optional":false,"defaultStatus":"pending"},{"id":"hydraulic-002","sourceNumber":2,"label":"Niveau d’huile","optional":false,"defaultStatus":"pending"},{"id":"hydraulic-003","sourceNumber":3,"label":"Pompes","optional":false,"defaultStatus":"pending"},{"id":"hydraulic-004","sourceNumber":4,"label":"Flexibles","optional":false,"defaultStatus":"pending"},{"id":"hydraulic-005","sourceNumber":5,"label":"Raccords","optional":false,"defaultStatus":"pending"},{"id":"hydraulic-006","sourceNumber":6,"label":"Distributeurs","optional":false,"defaultStatus":"pending"},{"id":"hydraulic-007","sourceNumber":7,"label":"Vérins","optional":false,"defaultStatus":"pending"},{"id":"hydraulic-008","sourceNumber":8,"label":"Fuites","optional":false,"defaultStatus":"pending"}]},{"id":"access","label":"Coffres / Accès","points":[{"id":"access-001","sourceNumber":1,"label":"Coffres","optional":false,"defaultStatus":"pending"},{"id":"access-002","sourceNumber":2,"label":"Capots","optional":false,"defaultStatus":"pending"},{"id":"access-003","sourceNumber":3,"label":"Échelles","optional":false,"defaultStatus":"pending"},{"id":"access-004","sourceNumber":4,"label":"Marchepieds","optional":false,"defaultStatus":"pending"},{"id":"access-005","sourceNumber":5,"label":"Poignées","optional":false,"defaultStatus":"pending"},{"id":"access-006","sourceNumber":6,"label":"Protections","optional":false,"defaultStatus":"pending"}]}],"upper":[{"id":"embase-faux-chassis","label":"Embase / faux-châssis","points":[{"id":"embase-faux-chassis-001","sourceNumber":1,"label":"État général embase / faux-châssis","optional":false,"defaultStatus":"pending"},{"id":"embase-faux-chassis-002","sourceNumber":2,"label":"Boulonnerie de fixation","optional":false,"defaultStatus":"pending"},{"id":"embase-faux-chassis-003","sourceNumber":3,"label":"Soudures","optional":false,"defaultStatus":"pending"},{"id":"embase-faux-chassis-004","sourceNumber":4,"label":"Absence de fissure","optional":false,"defaultStatus":"pending"},{"id":"embase-faux-chassis-005","sourceNumber":5,"label":"Absence de déformation","optional":false,"defaultStatus":"pending"},{"id":"embase-faux-chassis-006","sourceNumber":6,"label":"Corrosion","optional":false,"defaultStatus":"pending"},{"id":"embase-faux-chassis-007","sourceNumber":7,"label":"Platines / renforts","optional":false,"defaultStatus":"pending"},{"id":"embase-faux-chassis-008","sourceNumber":8,"label":"Fixations accessoires / protections","optional":false,"defaultStatus":"pending"}]},{"id":"colonne-orientation","label":"Colonne / orientation","points":[{"id":"colonne-orientation-001","sourceNumber":1,"label":"État général de la colonne","optional":false,"defaultStatus":"pending"},{"id":"colonne-orientation-002","sourceNumber":2,"label":"Boulonnerie de couronne","optional":false,"defaultStatus":"pending"},{"id":"colonne-orientation-003","sourceNumber":3,"label":"Graissage","optional":false,"defaultStatus":"pending"},{"id":"colonne-orientation-004","sourceNumber":4,"label":"Jeu","optional":false,"defaultStatus":"pending"},{"id":"colonne-orientation-005","sourceNumber":5,"label":"Dentures","optional":false,"defaultStatus":"pending"},{"id":"colonne-orientation-006","sourceNumber":6,"label":"Pignon / motoréducteur d’orientation","optional":false,"defaultStatus":"pending"},{"id":"colonne-orientation-007","sourceNumber":7,"label":"Frein d’orientation","optional":false,"defaultStatus":"pending"},{"id":"colonne-orientation-008","sourceNumber":8,"label":"Rotation gauche / droite","optional":false,"defaultStatus":"pending"},{"id":"colonne-orientation-009","sourceNumber":9,"label":"Butées / limitation d’orientation","optional":false,"defaultStatus":"pending"},{"id":"colonne-orientation-010","sourceNumber":10,"label":"Flexibles / passage tournant","optional":false,"defaultStatus":"pending"}]},{"id":"bras-principal-secondaire","label":"Bras principal / secondaire","points":[{"id":"bras-principal-secondaire-001","sourceNumber":1,"label":"État général des bras","optional":false,"defaultStatus":"pending"},{"id":"bras-principal-secondaire-002","sourceNumber":2,"label":"Absence de fissure / déformation / choc","optional":false,"defaultStatus":"pending"},{"id":"bras-principal-secondaire-003","sourceNumber":3,"label":"Soudures","optional":false,"defaultStatus":"pending"},{"id":"bras-principal-secondaire-004","sourceNumber":4,"label":"Axes","optional":false,"defaultStatus":"pending"},{"id":"bras-principal-secondaire-005","sourceNumber":5,"label":"Bagues / jeux","optional":false,"defaultStatus":"pending"},{"id":"bras-principal-secondaire-006","sourceNumber":6,"label":"Graissage articulations","optional":false,"defaultStatus":"pending"},{"id":"bras-principal-secondaire-007","sourceNumber":7,"label":"Butées","optional":false,"defaultStatus":"pending"},{"id":"bras-principal-secondaire-008","sourceNumber":8,"label":"Passage flexibles / câbles","optional":false,"defaultStatus":"pending"},{"id":"bras-principal-secondaire-009","sourceNumber":9,"label":"Protections","optional":false,"defaultStatus":"pending"},{"id":"bras-principal-secondaire-010","sourceNumber":10,"label":"Repères / marquages","optional":false,"defaultStatus":"pending"}]},{"id":"extensions-telescopiques","label":"Extensions télescopiques","points":[{"id":"extensions-telescopiques-001","sourceNumber":1,"label":"État des éléments télescopiques","optional":false,"defaultStatus":"pending"},{"id":"extensions-telescopiques-002","sourceNumber":2,"label":"Patins / guidages","optional":false,"defaultStatus":"pending"},{"id":"extensions-telescopiques-003","sourceNumber":3,"label":"Jeux","optional":false,"defaultStatus":"pending"},{"id":"extensions-telescopiques-004","sourceNumber":4,"label":"Vérin(s) de télescopage","optional":false,"defaultStatus":"pending"},{"id":"extensions-telescopiques-005","sourceNumber":5,"label":"Chaînes / câbles de synchronisation si équipés","optional":true,"defaultStatus":"na"},{"id":"extensions-telescopiques-006","sourceNumber":6,"label":"Flexibles / enrouleurs","optional":false,"defaultStatus":"pending"},{"id":"extensions-telescopiques-007","sourceNumber":7,"label":"Fin de course / détection de position","optional":false,"defaultStatus":"pending"},{"id":"extensions-telescopiques-008","sourceNumber":8,"label":"Sortie / rentrée complète","optional":false,"defaultStatus":"pending"},{"id":"extensions-telescopiques-009","sourceNumber":9,"label":"Absence de point dur","optional":false,"defaultStatus":"pending"}]},{"id":"verins-articulations","label":"Vérins / articulations","points":[{"id":"verins-articulations-001","sourceNumber":1,"label":"Vérin de levage principal","optional":false,"defaultStatus":"pending"},{"id":"verins-articulations-002","sourceNumber":2,"label":"Vérin de bras secondaire","optional":false,"defaultStatus":"pending"},{"id":"verins-articulations-003","sourceNumber":3,"label":"Autres vérins de mouvement","optional":false,"defaultStatus":"pending"},{"id":"verins-articulations-004","sourceNumber":4,"label":"Tiges de vérins","optional":false,"defaultStatus":"pending"},{"id":"verins-articulations-005","sourceNumber":5,"label":"Joints / suintements","optional":false,"defaultStatus":"pending"},{"id":"verins-articulations-006","sourceNumber":6,"label":"Axes","optional":false,"defaultStatus":"pending"},{"id":"verins-articulations-007","sourceNumber":7,"label":"Bagues","optional":false,"defaultStatus":"pending"},{"id":"verins-articulations-008","sourceNumber":8,"label":"Goupilles / sécurisation","optional":false,"defaultStatus":"pending"},{"id":"verins-articulations-009","sourceNumber":9,"label":"Graissage","optional":false,"defaultStatus":"pending"},{"id":"verins-articulations-010","sourceNumber":10,"label":"Jeux anormaux","optional":false,"defaultStatus":"pending"}]},{"id":"hydraulique-grue","label":"Hydraulique grue","points":[{"id":"hydraulique-grue-001","sourceNumber":1,"label":"Réservoir","optional":false,"defaultStatus":"pending"},{"id":"hydraulique-grue-002","sourceNumber":2,"label":"Niveau d’huile","optional":false,"defaultStatus":"pending"},{"id":"hydraulique-grue-003","sourceNumber":3,"label":"Pompe(s)","optional":false,"defaultStatus":"pending"},{"id":"hydraulique-grue-004","sourceNumber":4,"label":"Filtration","optional":false,"defaultStatus":"pending"},{"id":"hydraulique-grue-005","sourceNumber":5,"label":"Flexibles","optional":false,"defaultStatus":"pending"},{"id":"hydraulique-grue-006","sourceNumber":6,"label":"Raccords","optional":false,"defaultStatus":"pending"},{"id":"hydraulique-grue-007","sourceNumber":7,"label":"Distributeurs","optional":false,"defaultStatus":"pending"},{"id":"hydraulique-grue-008","sourceNumber":8,"label":"Clapets / valves de sécurité","optional":false,"defaultStatus":"pending"},{"id":"hydraulique-grue-009","sourceNumber":9,"label":"Passage tournant","optional":false,"defaultStatus":"pending"},{"id":"hydraulique-grue-010","sourceNumber":10,"label":"Fuites","optional":false,"defaultStatus":"pending"},{"id":"hydraulique-grue-011","sourceNumber":11,"label":"Température / bruit anormal","optional":false,"defaultStatus":"pending"}]},{"id":"commandes-radiocommande","label":"Commandes / radiocommande","points":[{"id":"commandes-radiocommande-001","sourceNumber":1,"label":"Commandes au poste fixe","optional":false,"defaultStatus":"pending"},{"id":"commandes-radiocommande-002","sourceNumber":2,"label":"Radiocommande si équipée","optional":true,"defaultStatus":"na"},{"id":"commandes-radiocommande-003","sourceNumber":3,"label":"Sélecteur poste de commande","optional":false,"defaultStatus":"pending"},{"id":"commandes-radiocommande-004","sourceNumber":4,"label":"Arrêt d’urgence","optional":false,"defaultStatus":"pending"},{"id":"commandes-radiocommande-005","sourceNumber":5,"label":"Commande homme mort / validation","optional":false,"defaultStatus":"pending"},{"id":"commandes-radiocommande-006","sourceNumber":6,"label":"Progressivité des mouvements","optional":false,"defaultStatus":"pending"},{"id":"commandes-radiocommande-007","sourceNumber":7,"label":"Retour au neutre","optional":false,"defaultStatus":"pending"},{"id":"commandes-radiocommande-008","sourceNumber":8,"label":"Affichage / voyants","optional":false,"defaultStatus":"pending"},{"id":"commandes-radiocommande-009","sourceNumber":9,"label":"Batterie / chargeur radiocommande","optional":false,"defaultStatus":"pending"},{"id":"commandes-radiocommande-010","sourceNumber":10,"label":"Avertisseur sonore","optional":false,"defaultStatus":"pending"}]},{"id":"securites-limiteur-de-charge","label":"Sécurités / limiteur de charge","points":[{"id":"securites-limiteur-de-charge-001","sourceNumber":1,"label":"Limiteur de charge / moment","optional":false,"defaultStatus":"pending"},{"id":"securites-limiteur-de-charge-002","sourceNumber":2,"label":"Affichage charge / portée si équipé","optional":true,"defaultStatus":"na"},{"id":"securites-limiteur-de-charge-003","sourceNumber":3,"label":"Capteurs de position","optional":false,"defaultStatus":"pending"},{"id":"securites-limiteur-de-charge-004","sourceNumber":4,"label":"Sécurité stabilisation","optional":false,"defaultStatus":"pending"},{"id":"securites-limiteur-de-charge-005","sourceNumber":5,"label":"Limitation de zone / hauteur si équipée","optional":true,"defaultStatus":"na"},{"id":"securites-limiteur-de-charge-006","sourceNumber":6,"label":"Alarmes","optional":false,"defaultStatus":"pending"},{"id":"securites-limiteur-de-charge-007","sourceNumber":7,"label":"Arrêts d’urgence","optional":false,"defaultStatus":"pending"},{"id":"securites-limiteur-de-charge-008","sourceNumber":8,"label":"Coupure des mouvements dangereux","optional":false,"defaultStatus":"pending"},{"id":"securites-limiteur-de-charge-009","sourceNumber":9,"label":"Verrouillages transport","optional":false,"defaultStatus":"pending"},{"id":"securites-limiteur-de-charge-010","sourceNumber":10,"label":"Signalisation / avertisseurs","optional":false,"defaultStatus":"pending"}]},{"id":"crochet-accessoires","label":"Crochet / accessoires","points":[{"id":"crochet-accessoires-001","sourceNumber":1,"label":"Crochet","optional":false,"defaultStatus":"pending"},{"id":"crochet-accessoires-002","sourceNumber":2,"label":"Linguet de sécurité","optional":false,"defaultStatus":"pending"},{"id":"crochet-accessoires-003","sourceNumber":3,"label":"Marquage CMU","optional":false,"defaultStatus":"pending"},{"id":"crochet-accessoires-004","sourceNumber":4,"label":"Émerillon / rotation","optional":false,"defaultStatus":"pending"},{"id":"crochet-accessoires-005","sourceNumber":5,"label":"Manilles / accessoires fournis","optional":false,"defaultStatus":"pending"},{"id":"crochet-accessoires-006","sourceNumber":6,"label":"Poulies / moufle si équipé","optional":true,"defaultStatus":"na"},{"id":"crochet-accessoires-007","sourceNumber":7,"label":"Fixation des accessoires","optional":false,"defaultStatus":"pending"},{"id":"crochet-accessoires-008","sourceNumber":8,"label":"Rangement / verrouillage transport","optional":false,"defaultStatus":"pending"}]},{"id":"treuil-si-equipe","label":"Treuil si équipé","points":[{"id":"treuil-si-equipe-001","sourceNumber":1,"label":"Câble","optional":true,"defaultStatus":"na"},{"id":"treuil-si-equipe-002","sourceNumber":2,"label":"Tambour","optional":true,"defaultStatus":"na"},{"id":"treuil-si-equipe-003","sourceNumber":3,"label":"Guide-câble","optional":true,"defaultStatus":"na"},{"id":"treuil-si-equipe-004","sourceNumber":4,"label":"Réducteur","optional":true,"defaultStatus":"na"},{"id":"treuil-si-equipe-005","sourceNumber":5,"label":"Frein","optional":true,"defaultStatus":"na"},{"id":"treuil-si-equipe-006","sourceNumber":6,"label":"Fixations","optional":true,"defaultStatus":"na"},{"id":"treuil-si-equipe-007","sourceNumber":7,"label":"Enroulement","optional":true,"defaultStatus":"na"},{"id":"treuil-si-equipe-008","sourceNumber":8,"label":"Poulies / réas","optional":true,"defaultStatus":"na"},{"id":"treuil-si-equipe-009","sourceNumber":9,"label":"Fin de course","optional":true,"defaultStatus":"na"},{"id":"treuil-si-equipe-010","sourceNumber":10,"label":"Crochet / moufle","optional":true,"defaultStatus":"na"}]},{"id":"essais-fonctionnels-sans-charge","label":"Essais fonctionnels sans charge","points":[{"id":"essais-fonctionnels-sans-charge-001","sourceNumber":1,"label":"Levage / abaissement bras principal","optional":false,"defaultStatus":"pending"},{"id":"essais-fonctionnels-sans-charge-002","sourceNumber":2,"label":"Ouverture / fermeture bras secondaire","optional":false,"defaultStatus":"pending"},{"id":"essais-fonctionnels-sans-charge-003","sourceNumber":3,"label":"Télescopage sortie / rentrée","optional":false,"defaultStatus":"pending"},{"id":"essais-fonctionnels-sans-charge-004","sourceNumber":4,"label":"Orientation gauche / droite","optional":false,"defaultStatus":"pending"},{"id":"essais-fonctionnels-sans-charge-005","sourceNumber":5,"label":"Fonctionnement commandes au poste fixe","optional":false,"defaultStatus":"pending"},{"id":"essais-fonctionnels-sans-charge-006","sourceNumber":6,"label":"Fonctionnement radiocommande si équipée","optional":true,"defaultStatus":"na"},{"id":"essais-fonctionnels-sans-charge-007","sourceNumber":7,"label":"Progressivité / retour au neutre","optional":false,"defaultStatus":"pending"},{"id":"essais-fonctionnels-sans-charge-008","sourceNumber":8,"label":"Arrêt d’urgence","optional":false,"defaultStatus":"pending"},{"id":"essais-fonctionnels-sans-charge-009","sourceNumber":9,"label":"Fonctionnement des sécurités","optional":false,"defaultStatus":"pending"},{"id":"essais-fonctionnels-sans-charge-010","sourceNumber":10,"label":"Absence de bruit anormal","optional":false,"defaultStatus":"pending"},{"id":"essais-fonctionnels-sans-charge-011","sourceNumber":11,"label":"Absence de fuite pendant les mouvements","optional":false,"defaultStatus":"pending"}]},{"id":"essais-avec-charge","label":"Essais avec charge","points":[{"id":"essais-avec-charge-001","sourceNumber":1,"label":"Levage avec charge selon procédure applicable","optional":false,"defaultStatus":"pending"},{"id":"essais-avec-charge-002","sourceNumber":2,"label":"Maintien de la charge","optional":false,"defaultStatus":"pending"},{"id":"essais-avec-charge-003","sourceNumber":3,"label":"Fonctionnement clapets de maintien","optional":false,"defaultStatus":"pending"},{"id":"essais-avec-charge-004","sourceNumber":4,"label":"Orientation avec charge","optional":false,"defaultStatus":"pending"},{"id":"essais-avec-charge-005","sourceNumber":5,"label":"Télescopage avec charge si autorisé","optional":false,"defaultStatus":"pending"},{"id":"essais-avec-charge-006","sourceNumber":6,"label":"Contrôle du limiteur de charge / moment","optional":false,"defaultStatus":"pending"},{"id":"essais-avec-charge-007","sourceNumber":7,"label":"Contrôle des alarmes et coupures","optional":false,"defaultStatus":"pending"}]}],"upperLabel":"Bras de grue"},"CN":{"carrier":[{"id":"documentation","label":"Documentation et plaques","points":[{"id":"documentation-001","sourceNumber":1,"label":"Plaques constructeur","optional":false,"defaultStatus":"pending","photoRequired":true,"sourceComment":"photos obligatoire ou bouton NA","plateScope":"chassis+equipment"},{"id":"documentation-002","sourceNumber":2,"label":"Numéro de série","optional":false,"defaultStatus":"pending","sourceComment":"i"},{"id":"documentation-003","sourceNumber":3,"label":"Carte grise","optional":false,"defaultStatus":"pending"},{"id":"documentation-004","sourceNumber":4,"label":"Carnet d’entretien","optional":false,"defaultStatus":"pending"},{"id":"documentation-005","sourceNumber":5,"label":"Documents réglementaires","optional":false,"defaultStatus":"pending"},{"id":"documentation-006","sourceNumber":6,"label":"Vue d’ensemble","optional":false,"defaultStatus":"pending","photoRequired":true,"sourceComment":"photos obligatoire ou bouton NA"}]},{"id":"structure","label":"Châssis / Structure","points":[{"id":"structure-001","sourceNumber":1,"label":"État général du châssis","optional":false,"defaultStatus":"pending"},{"id":"structure-002","sourceNumber":2,"label":"Soudures","optional":false,"defaultStatus":"pending"},{"id":"structure-003","sourceNumber":3,"label":"Fixations","optional":false,"defaultStatus":"pending"},{"id":"structure-004","sourceNumber":4,"label":"Corrosion","optional":false,"defaultStatus":"pending"},{"id":"structure-005","sourceNumber":5,"label":"Déformations","optional":false,"defaultStatus":"pending"},{"id":"structure-006","sourceNumber":6,"label":"Protections","optional":false,"defaultStatus":"pending"}]},{"id":"powertrain","label":"Moteur & Transmission","points":[{"id":"powertrain-001","sourceNumber":1,"label":"Niveau d’huile moteur","optional":false,"defaultStatus":"pending"},{"id":"powertrain-002","sourceNumber":2,"label":"Fuites moteur","optional":false,"defaultStatus":"pending"},{"id":"powertrain-003","sourceNumber":3,"label":"Courroies et tendeurs","optional":false,"defaultStatus":"pending"},{"id":"powertrain-004","sourceNumber":4,"label":"Circuit de refroidissement","optional":false,"defaultStatus":"pending"},{"id":"powertrain-005","sourceNumber":5,"label":"Filtration","optional":false,"defaultStatus":"pending"},{"id":"powertrain-006","sourceNumber":6,"label":"Échappement","optional":false,"defaultStatus":"pending"},{"id":"powertrain-007","sourceNumber":1,"label":"Absence fuite moyeux / ponts","optional":false,"defaultStatus":"pending"},{"id":"powertrain-008","sourceNumber":2,"label":"État suspensions","optional":false,"defaultStatus":"pending"},{"id":"powertrain-009","sourceNumber":3,"label":"Direction, rotules, vérins et modes de direction","optional":false,"defaultStatus":"pending"},{"id":"powertrain-010","sourceNumber":4,"label":"frein de parc","optional":false,"defaultStatus":"pending"},{"id":"powertrain-011","sourceNumber":5,"label":"Frein de service","optional":false,"defaultStatus":"pending","sourceComment":"bouton essaie dynamique O/N"}]},{"id":"stabilisers","label":"Stabilisateurs","points":[{"id":"stabilisers-001","sourceNumber":1,"label":"État structure stabilisateurs","optional":false,"defaultStatus":"pending"},{"id":"stabilisers-002","sourceNumber":2,"label":"Absence fissure poutres stabilisation","optional":false,"defaultStatus":"pending"},{"id":"stabilisers-003","sourceNumber":3,"label":"État vérins stabilisation","optional":false,"defaultStatus":"pending"},{"id":"stabilisers-004","sourceNumber":4,"label":"Absence fuite vérins / flexibles","optional":false,"defaultStatus":"pending"},{"id":"stabilisers-005","sourceNumber":5,"label":"État patins / semelles appui","optional":false,"defaultStatus":"pending"},{"id":"stabilisers-006","sourceNumber":6,"label":"Axes, bagues, goupilles présents et sécurisés","optional":false,"defaultStatus":"pending"},{"id":"stabilisers-007","sourceNumber":7,"label":"Sortie / rentrée stabilisateurs","optional":false,"defaultStatus":"pending"}]},{"id":"tyres","label":"Pneumatiques","points":[{"id":"tyres-001","sourceNumber":1,"label":"Usure","optional":false,"defaultStatus":"pending"},{"id":"tyres-002","sourceNumber":2,"label":"Pression","optional":false,"defaultStatus":"pending"},{"id":"tyres-003","sourceNumber":3,"label":"Flancs","optional":false,"defaultStatus":"pending"},{"id":"tyres-004","sourceNumber":4,"label":"Jantes","optional":false,"defaultStatus":"pending"},{"id":"tyres-005","sourceNumber":5,"label":"Écrous de roues","optional":false,"defaultStatus":"pending"},{"id":"tyres-006","sourceNumber":6,"label":"Valves","optional":false,"defaultStatus":"pending"}]},{"id":"lighting","label":"Éclairage","points":[{"id":"lighting-001","sourceNumber":1,"label":"Feux de route","optional":false,"defaultStatus":"pending"},{"id":"lighting-002","sourceNumber":2,"label":"Feux de position","optional":false,"defaultStatus":"pending"},{"id":"lighting-003","sourceNumber":3,"label":"Clignotants","optional":false,"defaultStatus":"pending"},{"id":"lighting-004","sourceNumber":4,"label":"Feux stop","optional":false,"defaultStatus":"pending"},{"id":"lighting-005","sourceNumber":5,"label":"Feux de recul","optional":false,"defaultStatus":"pending"},{"id":"lighting-006","sourceNumber":6,"label":"Feux de gabarit tourelle","optional":false,"defaultStatus":"pending"}]},{"id":"cab","label":"Cabine porteur","points":[{"id":"cab-001","sourceNumber":1,"label":"État cabine","optional":false,"defaultStatus":"pending"},{"id":"cab-002","sourceNumber":2,"label":"Siège","optional":false,"defaultStatus":"pending"},{"id":"cab-003","sourceNumber":3,"label":"Ceinture","optional":false,"defaultStatus":"pending"},{"id":"cab-004","sourceNumber":4,"label":"Rétroviseurs","optional":false,"defaultStatus":"pending"},{"id":"cab-005","sourceNumber":5,"label":"Essuie-glaces","optional":false,"defaultStatus":"pending"},{"id":"cab-006","sourceNumber":6,"label":"Tableau de bord","optional":false,"defaultStatus":"pending"},{"id":"cab-007","sourceNumber":7,"label":"Avertisseur sonore","optional":false,"defaultStatus":"pending"}]},{"id":"electrical","label":"Électricité porteur","points":[{"id":"electrical-001","sourceNumber":1,"label":"Batteries","optional":false,"defaultStatus":"pending"},{"id":"electrical-002","sourceNumber":2,"label":"Coupe-batterie","optional":false,"defaultStatus":"pending"},{"id":"electrical-003","sourceNumber":3,"label":"Faisceaux","optional":false,"defaultStatus":"pending"},{"id":"electrical-004","sourceNumber":4,"label":"Connecteurs","optional":false,"defaultStatus":"pending"},{"id":"electrical-005","sourceNumber":5,"label":"Fusibles","optional":false,"defaultStatus":"pending"},{"id":"electrical-006","sourceNumber":6,"label":"Alternateur","optional":false,"defaultStatus":"pending"},{"id":"electrical-007","sourceNumber":7,"label":"Démarreur","optional":false,"defaultStatus":"pending"}]},{"id":"hydraulic","label":"Hydraulique porteur","points":[{"id":"hydraulic-001","sourceNumber":1,"label":"Réservoir","optional":false,"defaultStatus":"pending"},{"id":"hydraulic-002","sourceNumber":2,"label":"Niveau d’huile","optional":false,"defaultStatus":"pending"},{"id":"hydraulic-003","sourceNumber":3,"label":"Pompes","optional":false,"defaultStatus":"pending"},{"id":"hydraulic-004","sourceNumber":4,"label":"Flexibles","optional":false,"defaultStatus":"pending"},{"id":"hydraulic-005","sourceNumber":5,"label":"Raccords","optional":false,"defaultStatus":"pending"},{"id":"hydraulic-006","sourceNumber":6,"label":"Distributeurs","optional":false,"defaultStatus":"pending"},{"id":"hydraulic-007","sourceNumber":7,"label":"Vérins","optional":false,"defaultStatus":"pending"},{"id":"hydraulic-008","sourceNumber":8,"label":"Fuites","optional":false,"defaultStatus":"pending"}]},{"id":"access","label":"Coffres / Accès","points":[{"id":"access-001","sourceNumber":1,"label":"Coffres","optional":false,"defaultStatus":"pending"},{"id":"access-002","sourceNumber":2,"label":"Capots","optional":false,"defaultStatus":"pending"},{"id":"access-003","sourceNumber":3,"label":"Échelles","optional":false,"defaultStatus":"pending"},{"id":"access-004","sourceNumber":4,"label":"Marchepieds","optional":false,"defaultStatus":"pending"},{"id":"access-005","sourceNumber":5,"label":"Poignées","optional":false,"defaultStatus":"pending"},{"id":"access-006","sourceNumber":6,"label":"Protections","optional":false,"defaultStatus":"pending"}]}],"upper":[{"id":"tourelle-orientation","label":"Tourelle / orientation","points":[{"id":"tourelle-orientation-001","sourceNumber":1,"label":"État général tourelle / embase","optional":false,"defaultStatus":"pending"},{"id":"tourelle-orientation-002","sourceNumber":2,"label":"Boulonnerie de couronne","optional":false,"defaultStatus":"pending"},{"id":"tourelle-orientation-003","sourceNumber":3,"label":"Graissage","optional":false,"defaultStatus":"pending"},{"id":"tourelle-orientation-004","sourceNumber":4,"label":"Jeu","optional":false,"defaultStatus":"pending"},{"id":"tourelle-orientation-005","sourceNumber":5,"label":"Dentures","optional":false,"defaultStatus":"pending"},{"id":"tourelle-orientation-006","sourceNumber":6,"label":"Motoréducteur d’orientation","optional":false,"defaultStatus":"pending"},{"id":"tourelle-orientation-007","sourceNumber":7,"label":"Frein d’orientation","optional":false,"defaultStatus":"pending"},{"id":"tourelle-orientation-008","sourceNumber":8,"label":"Rotation gauche / droite","optional":false,"defaultStatus":"pending"},{"id":"tourelle-orientation-009","sourceNumber":9,"label":"Butées / limitation d’orientation","optional":false,"defaultStatus":"pending"},{"id":"tourelle-orientation-010","sourceNumber":10,"label":"Passage tournant / flexibles","optional":false,"defaultStatus":"pending"}]},{"id":"structure-des-bras","label":"Structure des bras","points":[{"id":"structure-des-bras-001","sourceNumber":1,"label":"État général des bras","optional":false,"defaultStatus":"pending"},{"id":"structure-des-bras-002","sourceNumber":2,"label":"Absence de fissure / déformation / choc","optional":false,"defaultStatus":"pending"},{"id":"structure-des-bras-003","sourceNumber":3,"label":"Soudures","optional":false,"defaultStatus":"pending"},{"id":"structure-des-bras-004","sourceNumber":4,"label":"Axes","optional":false,"defaultStatus":"pending"},{"id":"structure-des-bras-005","sourceNumber":5,"label":"Bagues / jeux","optional":false,"defaultStatus":"pending"},{"id":"structure-des-bras-006","sourceNumber":6,"label":"Graissage articulations","optional":false,"defaultStatus":"pending"},{"id":"structure-des-bras-007","sourceNumber":7,"label":"Butées","optional":false,"defaultStatus":"pending"},{"id":"structure-des-bras-008","sourceNumber":8,"label":"Passage flexibles / câbles","optional":false,"defaultStatus":"pending"},{"id":"structure-des-bras-009","sourceNumber":9,"label":"Protections","optional":false,"defaultStatus":"pending"},{"id":"structure-des-bras-010","sourceNumber":10,"label":"Marquages / repères","optional":false,"defaultStatus":"pending"}]},{"id":"extensions-telescopiques","label":"Extensions télescopiques","points":[{"id":"extensions-telescopiques-001","sourceNumber":1,"label":"État des éléments télescopiques","optional":false,"defaultStatus":"pending"},{"id":"extensions-telescopiques-002","sourceNumber":2,"label":"Patins / guidages","optional":false,"defaultStatus":"pending"},{"id":"extensions-telescopiques-003","sourceNumber":3,"label":"Jeux","optional":false,"defaultStatus":"pending"},{"id":"extensions-telescopiques-004","sourceNumber":4,"label":"Vérin(s) de télescopage","optional":false,"defaultStatus":"pending"},{"id":"extensions-telescopiques-005","sourceNumber":5,"label":"Chaînes / câbles de synchronisation si équipés","optional":true,"defaultStatus":"na"},{"id":"extensions-telescopiques-006","sourceNumber":6,"label":"Flexibles / enrouleurs","optional":false,"defaultStatus":"pending"},{"id":"extensions-telescopiques-007","sourceNumber":7,"label":"Fin de course / détection de position","optional":false,"defaultStatus":"pending"},{"id":"extensions-telescopiques-008","sourceNumber":8,"label":"Sortie / rentrée complète","optional":false,"defaultStatus":"pending"},{"id":"extensions-telescopiques-009","sourceNumber":9,"label":"Absence de point dur","optional":false,"defaultStatus":"pending"}]},{"id":"verins-articulations","label":"Vérins / articulations","points":[{"id":"verins-articulations-001","sourceNumber":1,"label":"Vérins de levage","optional":false,"defaultStatus":"pending"},{"id":"verins-articulations-002","sourceNumber":2,"label":"Vérins d’articulation","optional":false,"defaultStatus":"pending"},{"id":"verins-articulations-003","sourceNumber":3,"label":"Vérin(s) de télescopage","optional":false,"defaultStatus":"pending"},{"id":"verins-articulations-004","sourceNumber":4,"label":"Vérin de mise à niveau panier","optional":false,"defaultStatus":"pending"},{"id":"verins-articulations-005","sourceNumber":5,"label":"Tiges de vérins","optional":false,"defaultStatus":"pending"},{"id":"verins-articulations-006","sourceNumber":6,"label":"Joints / suintements","optional":false,"defaultStatus":"pending"},{"id":"verins-articulations-007","sourceNumber":7,"label":"Axes / bagues","optional":false,"defaultStatus":"pending"},{"id":"verins-articulations-008","sourceNumber":8,"label":"Goupilles / sécurisation","optional":false,"defaultStatus":"pending"},{"id":"verins-articulations-009","sourceNumber":9,"label":"Graissage","optional":false,"defaultStatus":"pending"},{"id":"verins-articulations-010","sourceNumber":10,"label":"Jeux anormaux","optional":false,"defaultStatus":"pending"}]},{"id":"hydraulique-nacelle","label":"Hydraulique nacelle","points":[{"id":"hydraulique-nacelle-001","sourceNumber":1,"label":"Réservoir","optional":false,"defaultStatus":"pending"},{"id":"hydraulique-nacelle-002","sourceNumber":2,"label":"Niveau d’huile","optional":false,"defaultStatus":"pending"},{"id":"hydraulique-nacelle-003","sourceNumber":3,"label":"Pompe(s)","optional":false,"defaultStatus":"pending"},{"id":"hydraulique-nacelle-004","sourceNumber":4,"label":"Filtration","optional":false,"defaultStatus":"pending"},{"id":"hydraulique-nacelle-005","sourceNumber":5,"label":"Flexibles","optional":false,"defaultStatus":"pending"},{"id":"hydraulique-nacelle-006","sourceNumber":6,"label":"Raccords","optional":false,"defaultStatus":"pending"},{"id":"hydraulique-nacelle-007","sourceNumber":7,"label":"Distributeurs","optional":false,"defaultStatus":"pending"},{"id":"hydraulique-nacelle-008","sourceNumber":8,"label":"Clapets / valves de sécurité","optional":false,"defaultStatus":"pending"},{"id":"hydraulique-nacelle-009","sourceNumber":9,"label":"Passage tournant","optional":false,"defaultStatus":"pending"},{"id":"hydraulique-nacelle-010","sourceNumber":10,"label":"Fuites","optional":false,"defaultStatus":"pending"},{"id":"hydraulique-nacelle-011","sourceNumber":11,"label":"Pompe de secours si équipée","optional":true,"defaultStatus":"na"}]},{"id":"panier-nacelle","label":"Panier / nacelle","points":[{"id":"panier-nacelle-001","sourceNumber":1,"label":"État général du panier","optional":false,"defaultStatus":"pending"},{"id":"panier-nacelle-002","sourceNumber":2,"label":"Structure / soudures","optional":false,"defaultStatus":"pending"},{"id":"panier-nacelle-003","sourceNumber":3,"label":"Plancher antidérapant","optional":false,"defaultStatus":"pending"},{"id":"panier-nacelle-004","sourceNumber":4,"label":"Garde-corps","optional":false,"defaultStatus":"pending"},{"id":"panier-nacelle-005","sourceNumber":5,"label":"Portillon / fermeture","optional":false,"defaultStatus":"pending"},{"id":"panier-nacelle-006","sourceNumber":6,"label":"Verrouillage du portillon","optional":false,"defaultStatus":"pending"},{"id":"panier-nacelle-007","sourceNumber":7,"label":"Points d’ancrage EPI","optional":false,"defaultStatus":"pending"},{"id":"panier-nacelle-008","sourceNumber":8,"label":"Plaque charge nominale / nombre de personnes","optional":false,"defaultStatus":"pending"},{"id":"panier-nacelle-009","sourceNumber":9,"label":"Fixation du panier","optional":false,"defaultStatus":"pending"},{"id":"panier-nacelle-010","sourceNumber":10,"label":"Rotation panier si équipée","optional":true,"defaultStatus":"na"},{"id":"panier-nacelle-011","sourceNumber":11,"label":"Mise à niveau panier","optional":false,"defaultStatus":"pending"},{"id":"panier-nacelle-012","sourceNumber":12,"label":"Absence de déformation / corrosion","optional":false,"defaultStatus":"pending"}]},{"id":"commandes-au-sol","label":"Commandes au sol","points":[{"id":"commandes-au-sol-001","sourceNumber":1,"label":"Pupitre / boîtier de commande","optional":false,"defaultStatus":"pending"},{"id":"commandes-au-sol-002","sourceNumber":2,"label":"Sélecteur sol / panier","optional":false,"defaultStatus":"pending"},{"id":"commandes-au-sol-003","sourceNumber":3,"label":"Arrêt d’urgence","optional":false,"defaultStatus":"pending"},{"id":"commandes-au-sol-004","sourceNumber":4,"label":"Commande homme mort / validation","optional":false,"defaultStatus":"pending"},{"id":"commandes-au-sol-005","sourceNumber":5,"label":"Commandes de mouvements","optional":false,"defaultStatus":"pending"},{"id":"commandes-au-sol-006","sourceNumber":6,"label":"Retour au neutre","optional":false,"defaultStatus":"pending"},{"id":"commandes-au-sol-007","sourceNumber":7,"label":"Affichage / voyants","optional":false,"defaultStatus":"pending"},{"id":"commandes-au-sol-008","sourceNumber":8,"label":"Avertisseur sonore","optional":false,"defaultStatus":"pending"},{"id":"commandes-au-sol-009","sourceNumber":9,"label":"Commandes de secours","optional":false,"defaultStatus":"pending"},{"id":"commandes-au-sol-010","sourceNumber":10,"label":"Repérage des commandes","optional":false,"defaultStatus":"pending"}]},{"id":"commandes-panier","label":"Commandes panier","points":[{"id":"commandes-panier-001","sourceNumber":1,"label":"Pupitre de commande","optional":false,"defaultStatus":"pending"},{"id":"commandes-panier-002","sourceNumber":2,"label":"Arrêt d’urgence","optional":false,"defaultStatus":"pending"},{"id":"commandes-panier-003","sourceNumber":3,"label":"Commande homme mort / validation","optional":false,"defaultStatus":"pending"},{"id":"commandes-panier-004","sourceNumber":4,"label":"Commandes de mouvements","optional":false,"defaultStatus":"pending"},{"id":"commandes-panier-005","sourceNumber":5,"label":"Retour au neutre","optional":false,"defaultStatus":"pending"},{"id":"commandes-panier-006","sourceNumber":6,"label":"Progressivité","optional":false,"defaultStatus":"pending"},{"id":"commandes-panier-007","sourceNumber":7,"label":"Avertisseur sonore","optional":false,"defaultStatus":"pending"},{"id":"commandes-panier-008","sourceNumber":8,"label":"Affichage / voyants","optional":false,"defaultStatus":"pending"},{"id":"commandes-panier-009","sourceNumber":9,"label":"Sélecteurs / autorisations","optional":false,"defaultStatus":"pending"},{"id":"commandes-panier-010","sourceNumber":10,"label":"Protection du pupitre","optional":false,"defaultStatus":"pending"}]},{"id":"electricite-capteurs","label":"Électricité / capteurs","points":[{"id":"electricite-capteurs-001","sourceNumber":1,"label":"Batteries / alimentation","optional":false,"defaultStatus":"pending"},{"id":"electricite-capteurs-002","sourceNumber":2,"label":"Coupe-batterie","optional":false,"defaultStatus":"pending"},{"id":"electricite-capteurs-003","sourceNumber":3,"label":"Faisceaux","optional":false,"defaultStatus":"pending"},{"id":"electricite-capteurs-004","sourceNumber":4,"label":"Connecteurs","optional":false,"defaultStatus":"pending"},{"id":"electricite-capteurs-005","sourceNumber":5,"label":"Boîtiers électriques","optional":false,"defaultStatus":"pending"},{"id":"electricite-capteurs-006","sourceNumber":6,"label":"Capteurs d’angle / position","optional":false,"defaultStatus":"pending"},{"id":"electricite-capteurs-007","sourceNumber":7,"label":"Capteur d’inclinaison","optional":false,"defaultStatus":"pending"},{"id":"electricite-capteurs-008","sourceNumber":8,"label":"Fins de course","optional":false,"defaultStatus":"pending"},{"id":"electricite-capteurs-009","sourceNumber":9,"label":"Mise à la masse","optional":false,"defaultStatus":"pending"},{"id":"electricite-capteurs-010","sourceNumber":10,"label":"Éclairage de travail","optional":false,"defaultStatus":"pending"}]},{"id":"securites-limitations","label":"Sécurités / limitations","points":[{"id":"securites-limitations-001","sourceNumber":1,"label":"Limiteur de charge / moment si équipé","optional":true,"defaultStatus":"na"},{"id":"securites-limitations-002","sourceNumber":2,"label":"Limitation de portée / hauteur","optional":false,"defaultStatus":"pending"},{"id":"securites-limitations-003","sourceNumber":3,"label":"Capteur d’inclinaison / dévers","optional":false,"defaultStatus":"pending"},{"id":"securites-limitations-004","sourceNumber":4,"label":"Sécurité stabilisation","optional":false,"defaultStatus":"pending"},{"id":"securites-limitations-005","sourceNumber":5,"label":"Interverrouillage sol / panier","optional":false,"defaultStatus":"pending"},{"id":"securites-limitations-006","sourceNumber":6,"label":"Arrêts d’urgence","optional":false,"defaultStatus":"pending"},{"id":"securites-limitations-007","sourceNumber":7,"label":"Commande homme mort","optional":false,"defaultStatus":"pending"},{"id":"securites-limitations-008","sourceNumber":8,"label":"Coupure des mouvements dangereux","optional":false,"defaultStatus":"pending"},{"id":"securites-limitations-009","sourceNumber":9,"label":"Alarmes sonores / visuelles","optional":false,"defaultStatus":"pending"},{"id":"securites-limitations-010","sourceNumber":10,"label":"Sécurité de mise à niveau panier","optional":false,"defaultStatus":"pending"},{"id":"securites-limitations-011","sourceNumber":11,"label":"Protection contre mouvements incompatibles","optional":false,"defaultStatus":"pending"},{"id":"securites-limitations-012","sourceNumber":12,"label":"Verrouillages transport","optional":false,"defaultStatus":"pending"}]},{"id":"dispositifs-de-secours","label":"Dispositifs de secours","points":[{"id":"dispositifs-de-secours-001","sourceNumber":1,"label":"Descente d’urgence","optional":false,"defaultStatus":"pending"},{"id":"dispositifs-de-secours-002","sourceNumber":2,"label":"Pompe manuelle / électrique de secours","optional":false,"defaultStatus":"pending"},{"id":"dispositifs-de-secours-003","sourceNumber":3,"label":"Commandes de secours au sol","optional":false,"defaultStatus":"pending"},{"id":"dispositifs-de-secours-004","sourceNumber":4,"label":"Procédure de récupération opérateur disponible","optional":false,"defaultStatus":"pending"},{"id":"dispositifs-de-secours-005","sourceNumber":5,"label":"Fonctionnement en cas de perte d’alimentation principale","optional":false,"defaultStatus":"pending"},{"id":"dispositifs-de-secours-006","sourceNumber":6,"label":"Accès aux dispositifs de secours","optional":false,"defaultStatus":"pending"},{"id":"dispositifs-de-secours-007","sourceNumber":7,"label":"Repérage / instructions lisibles","optional":false,"defaultStatus":"pending"}]},{"id":"essais-fonctionnels","label":"Essais fonctionnels","points":[{"id":"essais-fonctionnels-001","sourceNumber":1,"label":"Élévation / abaissement","optional":false,"defaultStatus":"pending"},{"id":"essais-fonctionnels-002","sourceNumber":2,"label":"Déploiement / repliement","optional":false,"defaultStatus":"pending"},{"id":"essais-fonctionnels-003","sourceNumber":3,"label":"Télescopage sortie / rentrée","optional":false,"defaultStatus":"pending"},{"id":"essais-fonctionnels-004","sourceNumber":4,"label":"Orientation gauche / droite","optional":false,"defaultStatus":"pending"},{"id":"essais-fonctionnels-005","sourceNumber":5,"label":"Rotation panier si équipée","optional":true,"defaultStatus":"na"},{"id":"essais-fonctionnels-006","sourceNumber":6,"label":"Mise à niveau panier","optional":false,"defaultStatus":"pending"},{"id":"essais-fonctionnels-007","sourceNumber":7,"label":"Commandes au sol","optional":false,"defaultStatus":"pending"},{"id":"essais-fonctionnels-008","sourceNumber":8,"label":"Commandes panier","optional":false,"defaultStatus":"pending"},{"id":"essais-fonctionnels-009","sourceNumber":9,"label":"Progressivité / retour au neutre","optional":false,"defaultStatus":"pending"},{"id":"essais-fonctionnels-010","sourceNumber":10,"label":"Arrêts d’urgence","optional":false,"defaultStatus":"pending"},{"id":"essais-fonctionnels-011","sourceNumber":11,"label":"Dispositifs de secours","optional":false,"defaultStatus":"pending"},{"id":"essais-fonctionnels-012","sourceNumber":12,"label":"Fonctionnement des sécurités","optional":false,"defaultStatus":"pending"},{"id":"essais-fonctionnels-013","sourceNumber":13,"label":"Absence de bruit anormal","optional":false,"defaultStatus":"pending"},{"id":"essais-fonctionnels-014","sourceNumber":14,"label":"Absence de fuite pendant les mouvements","optional":false,"defaultStatus":"pending"}]},{"id":"essai-avec-charge-si-applicable","label":"Essai avec charge si applicable","points":[{"id":"essai-avec-charge-si-applicable-001","sourceNumber":1,"label":"Essai avec charge selon procédure constructeur / réglementation applicable","optional":true,"defaultStatus":"na"},{"id":"essai-avec-charge-si-applicable-002","sourceNumber":2,"label":"Maintien en position","optional":true,"defaultStatus":"na"},{"id":"essai-avec-charge-si-applicable-003","sourceNumber":3,"label":"Mise à niveau panier sous charge","optional":true,"defaultStatus":"na"},{"id":"essai-avec-charge-si-applicable-004","sourceNumber":4,"label":"Fonctionnement des sécurités sous charge","optional":true,"defaultStatus":"na"},{"id":"essai-avec-charge-si-applicable-005","sourceNumber":5,"label":"Contrôle des alarmes / limitations","optional":true,"defaultStatus":"na"}]}],"upperLabel":"Nacelle"}}};
  const REFERENTIAL_VERSION = VFG_REFERENTIAL.version || '1.0.0-P1';

  function machineLooksLikeMk(machine = {}) {
    const source = `${machine.model || ''} ${machine.designation || ''}`;
    return /\bMK/i.test(source);
  }

  function machineFamily(machine = {}, visit = null) {
    const category = String(machine.category || '').trim().toUpperCase();

    if (category === 'MK') return 'MK';

    if (category === 'GM') {
      if (visit?.craneFamily === 'GM' || visit?.craneFamily === 'MK') {
        return visit.craneFamily;
      }

      if (visit?.referentialVersion === REFERENTIAL_VERSION && typeof visit.mkMode === 'boolean') {
        return visit.mkMode ? 'MK' : 'GM';
      }

      if (visit?.mkMode === true) return 'MK';
      return machineLooksLikeMk(machine) ? 'MK' : 'GM';
    }

    if (category === 'CB' || category === 'CN') return category;
    return 'GM';
  }

  function familyReferential(machine = {}, visit = null) {
    const family = machineFamily(machine, visit);
    return VFG_REFERENTIAL.families[family] || VFG_REFERENTIAL.families.GM;
  }

  function zoneDisplayLabel(machine, zone, visit = null) {
    if (zone === 'carrier') return 'Châssis';
    return familyReferential(machine || {}, visit).upperLabel || 'Équipement';
  }



  function craneFamilyApplicable(machine = state.activeMachine, visit = state.activeVisit) {
    if (!machine) return false;
    const category = String(machine.category || '').trim().toUpperCase();
    return category === 'GM' || category === 'MK' ||
      ['GM', 'MK'].includes(machineFamily(machine, visit));
  }

  function craneFamilyLabel(machine = state.activeMachine, visit = state.activeVisit) {
    return machineFamily(machine || {}, visit || null) === 'MK'
      ? 'MK'
      : 'GM classique';
  }

  function craneFamilyIsLocked(machine = state.activeMachine, visit = state.activeVisit) {
    if (!visit || !craneFamilyApplicable(machine, visit)) return true;

    if (String(machine?.category || '').trim().toUpperCase() === 'MK') {
      return true;
    }

    return visit.craneFamilyLocked === true || visitHasStarted(visit);
  }

  function lockCraneFamilyIfNeeded(visit = state.activeVisit, machine = state.activeMachine) {
    if (!visit || !machine || !craneFamilyApplicable(machine, visit)) return;
    if (!visitHasStarted(visit)) return;

    if (visit.craneFamily !== 'GM' && visit.craneFamily !== 'MK') {
      visit.craneFamily = machineFamily(machine, visit);
    }

    visit.mkMode = visit.craneFamily === 'MK';
    visit.family = visit.craneFamily;

    if (visit.craneFamilyLocked !== true) {
      visit.craneFamilyLocked = true;
      visit.craneFamilyLockedAt = new Date().toISOString();
    }
  }

  function defaultVisitScope(machine = state.activeMachine, visit = state.activeVisit) {
    const family = machineFamily(machine || {}, visit || null);

    if (family === 'GM' || family === 'MK') {
      return { carrier: true, upper: true };
    }

    return { carrier: true, upper: true };
  }

  function ensureVisitScope(visit, machine = state.activeMachine) {
    if (!visit) return { carrier: true, upper: true };

    const family = machineFamily(machine || {}, visit);
    const forcedBoth = family === 'GM' || family === 'MK';

    if (!visit.scope || typeof visit.scope !== 'object') {
      visit.scope = defaultVisitScope(machine, visit);
    }

    visit.scope.carrier = forcedBoth ? true : visit.scope.carrier !== false;
    visit.scope.upper = forcedBoth ? true : visit.scope.upper !== false;

    // Une visite doit toujours contenir au moins une zone.
    if (!visit.scope.carrier && !visit.scope.upper) {
      visit.scope.carrier = true;
      visit.scope.upper = true;
    }

    return visit.scope;
  }

  function zoneEnabled(visit, zone) {
    if (!visit) return false;
    const scope = ensureVisitScope(visit, state.activeMachine);
    return zone === 'carrier' ? scope.carrier !== false : scope.upper !== false;
  }

  function visitHasStarted(visit) {
    if (!visit) return false;

    const controlled = ['carrier', 'upper'].some(zone =>
      (visit.zones?.[zone]?.sections || []).some(section => {
        if (section?.wholeNa === true || section?.wholeNe === true) return true;

        return (section.points || []).some(point => {
          if (['conform', 'finding', 'ne'].includes(point?.status)) return true;

          // Un N/A est considéré comme une action du contrôleur uniquement
          // si ce point n'était pas N/A par défaut dans le référentiel.
          if (point?.status === 'na' && point?.defaultStatus !== 'na') return true;

          return false;
        });
      })
    );

    const tyreControlled = (visit.tyres?.axles || []).some(axle =>
      (axle.tyres || []).some(tyre => tyre?.value && tyre.value !== 'pending')
    );

    return controlled || tyreControlled || (visit.findings || []).length > 0;
  }



  function zoneIsComplete(visit = state.activeVisit, zone = state.activeZone) {
    if (!visit || !zoneEnabled(visit, zone)) return true;
    const progress = zoneProgress(visit, zone);
    return Number(progress.remaining || 0) === 0;
  }

  function returnAfterSectionCompletion({
    zone = state.activeZone,
    section = currentSection(),
    message = 'Rubrique terminée.'
  } = {}) {
    if (!state.activeVisit || !zone || !section) return;

    const progress = sectionProgress(section);
    if (progress.remaining > 0) return;

    saveActiveVisit();

    if (
      zoneIsComplete(state.activeVisit, zone) &&
      supplementaryProgress(state.activeVisit, zone).remaining === 0
    ) {
      state.activeSectionId = null;
      renderDashboard();
      showScreen('dashboard');
      toast(`${zoneDisplayLabel(state.activeMachine, zone, state.activeVisit)} terminé.`);
      return;
    }

    state.activeSectionId = null;
    renderZone(zone);
    showScreen('zone');
    toast(message);
  }


  function hideFinishVisitDialog() {
    const dialog = $('#finishVisitDialog');
    if (!dialog) return;
    dialog.classList.add('hidden');
    dialog.setAttribute('aria-hidden', 'true');
  }

  function visitPointContexts(visit = state.activeVisit) {
    const contexts = [];
    if (!visit) return contexts;

    for (const zone of ['carrier', 'upper']) {
      if (!zoneEnabled(visit, zone)) continue;

      const zoneLabel = zoneDisplayLabel(state.activeMachine, zone, visit);
      const sections = [
        ...(visit.zones?.[zone]?.sections || []),
        supplementarySection(zone, visit)
      ].filter(Boolean);

      sections.forEach(section => {
        (section.points || []).forEach(point => {
          contexts.push({
            zone,
            zoneLabel,
            section,
            sectionId: section.id,
            sectionLabel: section.label,
            point
          });
        });
      });
    }

    return contexts;
  }

  function validateVisitCoherence(visit = state.activeVisit) {
    const issues = [];
    if (!visit) return issues;

    if (craneFamilyApplicable(state.activeMachine, visit)) {
      const family = machineFamily(state.activeMachine, visit);
      const expectedMkMode = family === 'MK';

      if (
        !['GM', 'MK'].includes(visit.craneFamily) ||
        visit.mkMode !== expectedMkMode ||
        visit.family !== family
      ) {
        issues.push({
          type: 'crane-family-coherence',
          zone: 'upper',
          zoneLabel: zoneDisplayLabel(state.activeMachine, 'upper', visit),
          sectionId: null,
          sectionLabel: 'Référentiel GM / MK',
          pointId: null,
          pointLabel: null,
          message: 'Le type de grue et le référentiel de la visite sont incohérents.',
          action: 'crane-family'
        });
      }
    }

    if (
      cbEquipmentRequired(state.activeMachine, visit) &&
      !cbEquipmentComplete(visit)
    ) {
      const missing = cbEquipmentMissingFields(visit);

      issues.push({
        type: 'cb-equipment-identity',
        zone: 'upper',
        zoneLabel: zoneDisplayLabel(state.activeMachine, 'upper', visit),
        sectionId: null,
        sectionLabel: 'Identification du bras de grue',
        pointId: null,
        pointLabel: null,
        message: `À compléter : ${cbEquipmentMissingLabel(missing)}.`,
        action: 'cb-identity'
      });
    }

    if (
      cnEquipmentRequired(state.activeMachine, visit) &&
      !cnEquipmentComplete(visit)
    ) {
      const missing = cnEquipmentMissingFields(visit);

      issues.push({
        type: 'cn-equipment-identity',
        zone: 'upper',
        zoneLabel: zoneDisplayLabel(state.activeMachine, 'upper', visit),
        sectionId: null,
        sectionLabel: 'Identification de la nacelle',
        pointId: null,
        pointLabel: null,
        message: `À compléter : ${cnEquipmentMissingLabel(missing)}.`,
        action: 'cn-identity'
      });
    }

    const contexts = visitPointContexts(visit);
    const byPointId = new Map(
      contexts.map(context => [context.point.id, context])
    );
    const findingById = new Map(
      (visit.findings || []).map(finding => [finding.id, finding])
    );

    const allowedStatuses = new Set([
      'pending',
      'conform',
      'finding',
      'na',
      'ne'
    ]);

    // Cohérence de chaque rubrique et de chaque point.
    for (const zone of ['carrier', 'upper']) {
      if (!zoneEnabled(visit, zone)) continue;

      const zoneLabel = zoneDisplayLabel(state.activeMachine, zone, visit);
      const sections = [
        ...(visit.zones?.[zone]?.sections || []),
        supplementarySection(zone, visit)
      ].filter(Boolean);

      for (const section of sections) {
        // Rubrique entière NE : justification obligatoire.
        if (section.wholeNe === true) {
          if (!String(section.neReason || '').trim()) {
            issues.push({
              type: 'section-ne-reason',
              zone,
              zoneLabel,
              sectionId: section.id,
              sectionLabel: section.label,
              message: 'Justification NE manquante pour toute la rubrique.',
              action: 'section-ne'
            });
          } else if (
            section.neReason === 'Autres' &&
            !String(section.neComment || '').trim()
          ) {
            issues.push({
              type: 'section-ne-comment',
              zone,
              zoneLabel,
              sectionId: section.id,
              sectionLabel: section.label,
              message: 'Commentaire obligatoire manquant pour le NE « Autres ».',
              action: 'section-ne'
            });
          }

          const inconsistent = (section.points || []).some(
            point => point.status !== 'ne'
          );

          if (inconsistent) {
            issues.push({
              type: 'section-ne-mismatch',
              zone,
              zoneLabel,
              sectionId: section.id,
              sectionLabel: section.label,
              message: 'Rubrique déclarée NE mais certains points ne sont pas NE.',
              action: 'section'
            });
          }
        }

        // Rubrique entière N/A : tous les points doivent être N/A.
        if (section.wholeNa === true) {
          const inconsistent = (section.points || []).some(
            point => point.status !== 'na'
          );

          if (inconsistent) {
            issues.push({
              type: 'section-na-mismatch',
              zone,
              zoneLabel,
              sectionId: section.id,
              sectionLabel: section.label,
              message: 'Rubrique déclarée N/A mais certains points ne sont pas N/A.',
              action: 'section'
            });
          }
        }

        if (isOptionalEquipmentSection(section)) {
          const present = section.optionPresent === true;

          if (
            !section.wholeNa &&
            !section.wholeNe &&
            present &&
            (section.points || []).every(point => point.status === 'na')
          ) {
            issues.push({
              type: 'optional-equipment-present-na',
              zone,
              zoneLabel,
              sectionId: section.id,
              sectionLabel: section.label,
              message: 'Option déclarée présente mais tous ses contrôles sont encore N/A.',
              action: 'section'
            });
          }

          if (
            !section.wholeNa &&
            !section.wholeNe &&
            !present &&
            (section.points || []).some(point => point.status !== 'na')
          ) {
            issues.push({
              type: 'optional-equipment-absent-active',
              zone,
              zoneLabel,
              sectionId: section.id,
              sectionLabel: section.label,
              message: 'Option déclarée absente mais certains contrôles sont actifs.',
              action: 'section'
            });
          }
        }

        for (const point of section.points || []) {
          if (
            point.optional &&
            !isOptionalEquipmentSection(section) &&
            !section.wholeNa &&
            !section.wholeNe
          ) {
            if (point.optionPresent === true && point.status === 'na') {
              issues.push({
                type: 'optional-point-present-na',
                zone,
                zoneLabel,
                sectionId: section.id,
                sectionLabel: section.label,
                pointId: point.id,
                pointLabel: point.label,
                message: 'Option déclarée présente mais le point est classé N/A.',
                action: 'point'
              });
            }

            if (point.optionPresent !== true && point.status !== 'na') {
              issues.push({
                type: 'optional-point-absent-active',
                zone,
                zoneLabel,
                sectionId: section.id,
                sectionLabel: section.label,
                pointId: point.id,
                pointLabel: point.label,
                message: 'Option déclarée absente mais son contrôle est actif.',
                action: 'point'
              });
            }
          }

          if (!allowedStatuses.has(point.status)) {
            issues.push({
              type: 'invalid-status',
              zone,
              zoneLabel,
              sectionId: section.id,
              sectionLabel: section.label,
              pointId: point.id,
              pointLabel: point.label,
              message: `Statut invalide : ${point.status || 'vide'}.`,
              action: 'point'
            });
            continue;
          }

          // Les points N/A et NE sont bien traités.
          if (point.status === 'ne') {
            if (!String(point.neReason || '').trim()) {
              issues.push({
                type: 'ne-reason',
                zone,
                zoneLabel,
                sectionId: section.id,
                sectionLabel: section.label,
                pointId: point.id,
                pointLabel: point.label,
                message: 'Justification NE manquante.',
                action: 'ne'
              });
            } else if (
              point.neReason === 'Autres' &&
              !String(point.neComment || '').trim()
            ) {
              issues.push({
                type: 'ne-comment',
                zone,
                zoneLabel,
                sectionId: section.id,
                sectionLabel: section.label,
                pointId: point.id,
                pointLabel: point.label,
                message: 'Commentaire obligatoire manquant pour le NE « Autres ».',
                action: 'ne'
              });
            }
          }

          // Photos obligatoires.
          if (
            point.photoRequired === true &&
            point.status !== 'na' &&
            point.status !== 'ne' &&
            !pointHasRequiredPhoto(point, visit)
          ) {
            issues.push({
              type: 'photo-required',
              zone,
              zoneLabel,
              sectionId: section.id,
              sectionLabel: section.label,
              pointId: point.id,
              pointLabel: point.label,
              message: 'Photo obligatoire manquante.',
              action: 'finding'
            });
          }

          // Statut Constat : il faut un constat réel et complet.
          if (point.status === 'finding') {
            if (!point.findingId) {
              issues.push({
                type: 'finding-id-missing',
                zone,
                zoneLabel,
                sectionId: section.id,
                sectionLabel: section.label,
                pointId: point.id,
                pointLabel: point.label,
                message: 'Point en constat sans constat associé.',
                action: 'finding'
              });
            } else {
              const finding = findingById.get(point.findingId);

              if (!finding) {
                issues.push({
                  type: 'finding-missing',
                  zone,
                  zoneLabel,
                  sectionId: section.id,
                  sectionLabel: section.label,
                  pointId: point.id,
                  pointLabel: point.label,
                  message: 'Constat associé introuvable.',
                  action: 'finding'
                });
              } else {
                if (!String(finding.level || '').trim()) {
                  issues.push({
                    type: 'finding-level',
                    zone,
                    zoneLabel,
                    sectionId: section.id,
                    sectionLabel: section.label,
                    pointId: point.id,
                    pointLabel: point.label,
                    message: 'Niveau du constat manquant.',
                    action: 'finding'
                  });
                }

                if (
                  finding.pointId !== point.id ||
                  finding.sectionId !== section.id
                ) {
                  issues.push({
                    type: 'finding-link',
                    zone,
                    zoneLabel,
                    sectionId: section.id,
                    sectionLabel: section.label,
                    pointId: point.id,
                    pointLabel: point.label,
                    message: 'Constat rattaché au mauvais point ou à la mauvaise rubrique.',
                    action: 'finding'
                  });
                }
              }
            }
          } else if (point.findingId) {
            issues.push({
              type: 'finding-link-orphan',
              zone,
              zoneLabel,
              sectionId: section.id,
              sectionLabel: section.label,
              pointId: point.id,
              pointLabel: point.label,
              message: 'Un constat est encore lié à un point qui n’est plus en statut Constat.',
              action: 'finding'
            });
          }
        }
      }
    }

    // Constats orphelins : constat enregistré sans point actif correspondant.
    for (const finding of visit.findings || []) {
      const context = byPointId.get(finding.pointId);

      // On ne bloque pas pour une zone volontairement exclue du périmètre.
      if (!context) {
        const findingZone = finding.zone || finding.area;
        if (
          findingZone &&
          ['carrier', 'upper'].includes(findingZone) &&
          !zoneEnabled(visit, findingZone)
        ) {
          continue;
        }

        issues.push({
          type: 'orphan-finding',
          zone: findingZone || 'carrier',
          zoneLabel: zoneDisplayLabel(
            state.activeMachine,
            findingZone || 'carrier',
            visit
          ),
          sectionId: finding.sectionId || null,
          sectionLabel: finding.sectionLabel || 'Constats',
          pointId: finding.pointId || null,
          pointLabel: finding.pointLabel || finding.title || 'Constat',
          message: 'Constat orphelin : aucun point de contrôle correspondant.',
          action: 'findings'
        });
        continue;
      }

      if (context.point.status !== 'finding') {
        issues.push({
          type: 'orphan-finding-status',
          zone: context.zone,
          zoneLabel: context.zoneLabel,
          sectionId: context.sectionId,
          sectionLabel: context.sectionLabel,
          pointId: context.point.id,
          pointLabel: context.point.label,
          message: 'Constat enregistré alors que le point n’est plus en statut Constat.',
          action: 'finding'
        });
      }

      if (
        context.point.findingId &&
        context.point.findingId !== finding.id
      ) {
        issues.push({
          type: 'orphan-finding-id',
          zone: context.zone,
          zoneLabel: context.zoneLabel,
          sectionId: context.sectionId,
          sectionLabel: context.sectionLabel,
          pointId: context.point.id,
          pointLabel: context.point.label,
          message: 'Plusieurs constats ou liaison de constat incohérente sur ce point.',
          action: 'finding'
        });
      }
    }

    // Déduplication pour éviter plusieurs messages identiques sur le même point.
    const seen = new Set();

    return issues.filter(issue => {
      const key = [
        issue.type,
        issue.zone,
        issue.sectionId,
        issue.pointId,
        issue.message
      ].join('|');

      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  async function navigateToVisitIssue(issue) {
    if (!issue) return;

    hideFinishVisitDialog();

    if (issue.action === 'findings') {
      openFindings(issue.zone || 'carrier', issue.sectionId || null);
      return;
    }

    if (issue.action === 'cb-identity') {
      focusFirstMissingCbEquipmentField();
      return;
    }

    if (issue.action === 'cn-identity') {
      focusFirstMissingCnEquipmentField();
      return;
    }

    if (issue.action === 'crane-family') {
      renderDashboard();
      showScreen('dashboard');
      toast('Vérifiez le référentiel GM / MK de cette visite.');
      return;
    }

    if (!issue.zone || !issue.sectionId) {
      renderDashboard();
      showScreen('dashboard');
      return;
    }

    renderZone(issue.zone);
    openInspection(issue.zone, issue.sectionId);

    if (issue.action === 'section-ne') {
      openWholeSectionNeDialog();
      return;
    }

    if (!issue.pointId) return;

    state.activePointId = issue.pointId;

    if (issue.action === 'ne') {
      openNeDialog(issue.pointId);
      return;
    }

    if (issue.action === 'finding') {
      await openFindingForm();
    }
  }

  function openFinishVisitCoherenceDialog(issues) {
    ensureFinishVisitUi();

    const title = $('#finishVisitDialog h2');
    if (title) title.textContent = 'Visite à vérifier';

    $('#finishVisitSummary').textContent =
      `${issues.length} incohérence(s) doivent être corrigée(s) avant de terminer la visite.`;

    const list = $('#finishVisitList');
    list.replaceChildren();

    issues.forEach(issue => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'finish-visit-item';

      const titleText = issue.pointLabel
        ? `${issue.sectionLabel} · ${issue.pointLabel}`
        : issue.sectionLabel;

      button.innerHTML = `
        <span>
          <strong>${escapeHtml(titleText || 'Élément à vérifier')}</strong>
          <small>${escapeHtml(issue.zoneLabel || '')} · ${escapeHtml(issue.message)}</small>
        </span>
        <span class="finish-visit-count">!</span>
      `;

      button.addEventListener('click', async () => {
        await navigateToVisitIssue(issue);
      });

      list.appendChild(button);
    });

    $('#finishVisitDialog').classList.remove('hidden');
    $('#finishVisitDialog').setAttribute('aria-hidden', 'false');
  }

  function unfinishedVisitSections(visit = state.activeVisit) {
    if (!visit) return [];

    const result = [];

    for (const zone of ['carrier', 'upper']) {
      if (!zoneEnabled(visit, zone)) continue;

      const zoneLabel = zoneDisplayLabel(state.activeMachine, zone, visit);
      const sections = visit.zones?.[zone]?.sections || [];

      sections.forEach(section => {
        const progress = sectionProgress(section);

        if (progress.remaining > 0) {
          result.push({
            zone,
            zoneLabel,
            sectionId: section.id,
            sectionLabel: section.label,
            remaining: progress.remaining,
            total: progress.total,
            supplementary: false
          });
        }
      });

      const extraSection = supplementarySection(zone, visit);
      const extraProgress = sectionProgress(extraSection);

      if (extraProgress.remaining > 0) {
        result.push({
          zone,
          zoneLabel,
          sectionId: extraSection.id,
          sectionLabel: extraSection.label,
          remaining: extraProgress.remaining,
          total: extraProgress.total,
          supplementary: true
        });
      }
    }

    return result;
  }

  function openFinishVisitIncompleteDialog(items) {
    ensureFinishVisitUi();

    const title = $('#finishVisitDialog h2');
    if (title) title.textContent = 'Visite incomplète';

    const totalRemaining = items.reduce(
      (sum, item) => sum + Number(item.remaining || 0),
      0
    );

    $('#finishVisitSummary').textContent =
      `${totalRemaining} point(s) restent à traiter dans ${items.length} rubrique(s).`;

    const list = $('#finishVisitList');
    list.replaceChildren();

    items.forEach(item => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'finish-visit-item';
      button.innerHTML = `
        <span>
          <strong>${escapeHtml(item.sectionLabel)}</strong>
          <small>${escapeHtml(item.zoneLabel)} · ${item.remaining}/${item.total} restant(s)${item.supplementary ? ' · contrôle ajouté' : ''}</small>
        </span>
        <span class="finish-visit-count">${item.remaining}</span>
      `;

      button.addEventListener('click', () => {
        $('#finishVisitDialog').classList.add('hidden');
        $('#finishVisitDialog').setAttribute('aria-hidden', 'true');

        renderZone(item.zone);
        openInspection(item.zone, item.sectionId);
      });

      list.appendChild(button);
    });

    $('#finishVisitDialog').classList.remove('hidden');
    $('#finishVisitDialog').setAttribute('aria-hidden', 'false');
  }

  function refreshFinishVisitButton() {
    const button = $('#finishVisit');
    if (!button || !state.activeVisit) return;

    const visit = state.activeVisit;
    const progress = visitProgressSummary(visit);
    const extra = supplementaryProgress(visit);
    const closed = ['Terminée', 'Synchronisée'].includes(visit.status);

    if (closed) {
      button.textContent = '✓ Visite terminée';
      button.disabled = true;
      button.dataset.remaining = '0';
      button.dataset.supplementaryRemaining = '0';
      return;
    }

    button.disabled = false;

    button.textContent = progress.remaining > 0
      ? `Terminer la visite · ${progress.remaining} restant(s) sur ${progress.total}`
      : '✓ Visite prête à terminer';

    button.dataset.remaining = String(progress.remaining);
    button.dataset.supplementaryRemaining = String(extra.remaining);
  }

  async function finishActiveVisit() {
    const visit = state.activeVisit;
    if (!visit) return;

    const unfinished = unfinishedVisitSections(visit);

    if (unfinished.length > 0) {
      openFinishVisitIncompleteDialog(unfinished);
      return;
    }

    const coherenceIssues = validateVisitCoherence(visit);

    if (coherenceIssues.length > 0) {
      openFinishVisitCoherenceDialog(coherenceIssues);
      return;
    }

    const progress = visitProgressSummary(visit);
    const standard = standardVisitProgressSummary(visit);
    const extra = supplementaryProgress(visit);

    const compositionText = extra.total > 0
      ? `\nRéférentiel applicable : ${standard.total} point(s).` +
        `\nContrôle(s) libre(s) ajouté(s) : ${extra.total}.` +
        `\nTotal de la visite : ${progress.total} point(s).`
      : `\nTotal de la visite : ${progress.total} point(s).`;

    const confirmed = confirm(
      `Tous les points de contrôle de la visite sont traités (${progress.total}/${progress.total}).` +
      `${compositionText}\n\n` +
      `Terminer définitivement cette visite ?`
    );

    if (!confirmed) return;

    visit.status = 'Terminée';
    visit.completedAt = new Date().toISOString();
    visit.reopenedAt = null;
    visit.coherenceValidatedAt = new Date().toISOString();
    visit.workflowVersion = 'POINT2-FINAL';

    saveActiveVisit();
    clearActiveVisitResumeMarker();
    renderDashboard();

    toast('Visite terminée et enregistrée.');
  }

  function standardVisitProgressSummary(visit) {
    if (!visit) return { remaining: 0, total: 0, controlled: 0 };

    const totals = ['carrier', 'upper'].reduce((summary, zone) => {
      if (!zoneEnabled(visit, zone)) return summary;

      const progress = standardZoneProgress(visit, zone);
      summary.remaining += Number(progress.remaining || 0);
      summary.total += Number(progress.total || 0);
      return summary;
    }, { remaining: 0, total: 0 });

    totals.controlled = Math.max(0, totals.total - totals.remaining);
    return totals;
  }

  function visitProgressSummary(visit) {
    if (!visit) return { remaining: 0, total: 0, controlled: 0 };

    const totals = ['carrier', 'upper'].reduce((summary, zone) => {
      if (!zoneEnabled(visit, zone)) return summary;

      // Total opérationnel de la visite = référentiel applicable + contrôles libres ajoutés.
      const progress = zoneProgress(visit, zone);
      summary.remaining += Number(progress.remaining || 0);
      summary.total += Number(progress.total || 0);
      return summary;
    }, { remaining: 0, total: 0 });

    totals.controlled = Math.max(0, totals.total - totals.remaining);
    return totals;
  }


  function saveActiveVisitResumeMarker(
    visit = state.activeVisit,
    machine = state.activeMachine
  ) {
    if (!visit?.id || !machine) return;

    const marker = {
      visitId: visit.id,
      machineId: machine.id || machine.parkNumber || '',
      parkNumber: machine.parkNumber || machine.id || '',
      savedAt: new Date().toISOString()
    };

    saveJson(STORAGE_KEYS.activeVisitResume, marker);
  }

  function clearActiveVisitResumeMarker() {
    try {
      localStorage.removeItem(STORAGE_KEYS.activeVisitResume);
    } catch (error) {
      console.warn('Impossible de supprimer le marqueur de reprise.', error);
    }
  }

  function loadActiveVisitResumeMarker() {
    return loadJson(STORAGE_KEYS.activeVisitResume, null);
  }

  function findStoredVisitById(visitId) {
    if (!visitId) return null;

    const visits = loadJson(STORAGE_KEYS.visits, []);
    return visits.find(visit => visit?.id === visitId) || null;
  }

  function findMachineForVisit(visit, resumeMarker = null) {
    if (!visit) return null;

    const candidates = [
      resumeMarker?.machineId,
      resumeMarker?.parkNumber,
      visit.machineId,
      visit.parkNumber,
      visit.machineKey
    ]
      .filter(Boolean)
      .map(value => String(value).trim().toUpperCase());

    if (!candidates.length) return null;

    return state.machines.find(machine => {
      const values = [
        machine.id,
        machine.parkNumber,
        machine.machineKey
      ]
        .filter(Boolean)
        .map(value => String(value).trim().toUpperCase());

      return candidates.some(candidate => values.includes(candidate));
    }) || null;
  }

  function visitResumeLabel(visit, machine) {
    const title = machine?.parkNumber || machine?.id || visit?.parkNumber || 'Machine';
    const date = formatVisitDate(visit?.visitDate);
    const status = visit?.status || 'Brouillon';
    return `${title} · ${date} · ${status}`;
  }

  async function offerResumeActiveVisit() {
    const marker = loadActiveVisitResumeMarker();
    if (!marker?.visitId) return false;

    const visit = findStoredVisitById(marker.visitId);

    if (!visit) {
      clearActiveVisitResumeMarker();
      return false;
    }

    // Une visite clôturée ne doit pas se rouvrir automatiquement.
    if (['Terminée', 'Synchronisée'].includes(visit.status)) {
      clearActiveVisitResumeMarker();
      return false;
    }

    const machine = findMachineForVisit(visit, marker);

    if (!machine) {
      console.warn(
        'Visite de reprise trouvée mais machine introuvable dans le parc :',
        marker.visitId
      );
      return false;
    }

    const confirmed = confirm(
      `Une visite en cours a été retrouvée :\n\n` +
      `${visitResumeLabel(visit, machine)}\n\n` +
      `Reprendre cette visite ?`
    );

    if (!confirmed) return false;

state.activeMachine = machine;

const migrated = ensureVisitSchema(visit, machine);
state.activeVisit = migrated.visit;

if (migrated.changed) {
  persistVisitRecord(state.activeVisit, {
    touch: true,
    sync: false
  });
}

saveActiveVisitResumeMarker(state.activeVisit, state.activeMachine);


    renderDashboard();
    showScreen('dashboard');

    toast('Visite en cours restaurée.');
    return true;
  }

  function registerEmergencyLocalSave() {
    const emergencySave = () => {
      if (!state.activeVisit?.id) return;

      try {
        // Pas de réseau ici : uniquement sauvegarde locale synchrone.
        const visits = loadJson(STORAGE_KEYS.visits, []);
        const visit = {
          ...state.activeVisit,
          updatedAt: new Date().toISOString()
        };

        const index = visits.findIndex(item => item.id === visit.id);

        if (index >= 0) visits[index] = visit;
        else visits.unshift(visit);

        saveJson(STORAGE_KEYS.visits, visits);
        saveActiveVisitResumeMarker(visit, state.activeMachine);
      } catch (error) {
        console.warn('Sauvegarde locale de fermeture impossible.', error);
      }
    };

    window.addEventListener('pagehide', emergencySave);
    window.addEventListener('beforeunload', emergencySave);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') emergencySave();
    });
  }

  function persistVisitRecord(visit, { touch = true, sync = true } = {}) {
    if (!visit?.id) return;

    if (touch) visit.updatedAt = new Date().toISOString();

    const visits = loadJson(STORAGE_KEYS.visits, []);
    const index = visits.findIndex(item => item.id === visit.id);

    if (index >= 0) visits[index] = visit;
    else visits.unshift(visit);

    saveJson(STORAGE_KEYS.visits, visits);

    if (
      state.activeVisit?.id === visit.id &&
      !['Terminée', 'Synchronisée'].includes(visit.status)
    ) {
      saveActiveVisitResumeMarker(visit, state.activeMachine);
    }

    if (sync) syncVisitToServer(visit);
  }

  function reopenVisitForEdit(visit) {
    if (!visit) return false;

    if (!['Terminée', 'Synchronisée'].includes(visit.status)) {
      return true;
    }

    if (visit.completedAt) {
      visit.lastCompletedAt = visit.completedAt;
      delete visit.completedAt;
    }

    visit.status = 'Brouillon';
    visit.reopenedAt = new Date().toISOString();
    visit.reopenCount = Number(visit.reopenCount || 0) + 1;

    return true;
  }

  function confirmReopenVisit(visit) {
    if (!visit || !['Terminée', 'Synchronisée'].includes(visit.status)) {
      return true;
    }

    const date = formatVisitDate(visit.visitDate);
    const status = visit.status;

    return confirm(
      `Cette visite du ${date} est ${status.toLowerCase()}.\n\n` +
      `OK : la rouvrir en brouillon pour la modifier\n` +
      `Annuler : ne pas ouvrir cette visite`
    );
  }

  function activateExistingVisit(existingVisit, machine) {
    const migrated = ensureVisitSchema(existingVisit, machine);
    const visit = migrated.visit;

    if (!confirmReopenVisit(visit)) {
      return null;
    }

    const wasClosed = ['Terminée', 'Synchronisée'].includes(visit.status);

    if (wasClosed) {
      reopenVisitForEdit(visit);
    }

   state.activeMachine = machine;
state.activeVisit = visit;
saveActiveVisitResumeMarker(visit, machine);

    // On ne touche pas à updatedAt lors d'une simple consultation/reprise.
    // En revanche, une migration de schéma ou une réouverture doit être persistée.
    if (migrated.changed || wasClosed) {
      persistVisitRecord(visit, { touch: true, sync: true });
    }

    return visit;
  }

  function visitScopeLabel(machine = state.activeMachine, visit = state.activeVisit) {
    const scope = ensureVisitScope(visit, machine);
    const carrierLabel = zoneDisplayLabel(machine, 'carrier', visit);
    const upperLabel = zoneDisplayLabel(machine, 'upper', visit);

    if (scope.carrier && scope.upper) return `${carrierLabel} + ${upperLabel}`;
    if (scope.carrier) return carrierLabel;
    return upperLabel;
  }


  function cbEquipmentRequired(machine = state.activeMachine, visit = state.activeVisit) {
    if (!machine || !visit) return false;
    return machineFamily(machine, visit) === 'CB' && zoneEnabled(visit, 'upper');
  }

  function cbEquipmentMissingFields(visit = state.activeVisit) {
    if (!visit) return ['brand', 'type', 'serialNumber'];

    const equipment = visit.cbEquipment || {};
    const missing = [];

    if (!String(equipment.brand || '').trim()) missing.push('brand');
    if (!String(equipment.type || '').trim()) missing.push('type');
    if (!String(equipment.serialNumber || '').trim()) missing.push('serialNumber');

    return missing;
  }

  function cbEquipmentComplete(visit = state.activeVisit) {
    return cbEquipmentMissingFields(visit).length === 0;
  }

  function cbEquipmentMissingLabel(fields = cbEquipmentMissingFields()) {
    const labels = {
      brand: 'Marque',
      type: 'Type',
      serialNumber: 'N° de série'
    };

    return fields.map(field => labels[field] || field).join(' · ');
  }


  function cnEquipmentRequired(machine = state.activeMachine, visit = state.activeVisit) {
    if (!machine || !visit) return false;
    return machineFamily(machine, visit) === 'CN' && zoneEnabled(visit, 'upper');
  }

  function cnEquipmentMissingFields(visit = state.activeVisit) {
    if (!visit) return ['brand', 'type', 'serialNumber'];

    const equipment = visit.cnEquipment || {};
    const missing = [];

    if (!String(equipment.brand || '').trim()) missing.push('brand');
    if (!String(equipment.type || '').trim()) missing.push('type');
    if (!String(equipment.serialNumber || '').trim()) missing.push('serialNumber');

    return missing;
  }

  function cnEquipmentComplete(visit = state.activeVisit) {
    return cnEquipmentMissingFields(visit).length === 0;
  }

  function cnEquipmentMissingLabel(fields = cnEquipmentMissingFields()) {
    const labels = {
      brand: 'Marque',
      type: 'Type',
      serialNumber: 'N° de série'
    };

    return fields.map(field => labels[field] || field).join(' · ');
  }

  function upperHoursLabel(machine = state.activeMachine, visit = state.activeVisit) {
    const family = machineFamily(machine || {}, visit || null);
    if (family === 'CB') return 'Heures bras de grue';
    if (family === 'CN') return 'Heures nacelle';
    if (family === 'MK') return 'Heures grue MK';
    return 'Heures tourelle';
  }

  function setFieldLabelText(inputId, value) {
    const input = document.getElementById(inputId);
    const label = input?.closest('label');
    if (!label) return;
    const textNode = Array.from(label.childNodes).find(node => node.nodeType === Node.TEXT_NODE);
    if (textNode) textNode.nodeValue = `${value}\n          `;
  }

  function refreshZoneLabels() {
    if (!state.activeMachine) return;

    const carrierLabel = zoneDisplayLabel(state.activeMachine, 'carrier', state.activeVisit);
    const upperLabel = zoneDisplayLabel(state.activeMachine, 'upper', state.activeVisit);

    const carrierTitle = document.querySelector('[data-zone="carrier"] .dashboard-copy h2');
    const upperTitle = document.querySelector('[data-zone="upper"] .dashboard-copy h2');

    if (carrierTitle) carrierTitle.textContent = carrierLabel;
    if (upperTitle) upperTitle.textContent = upperLabel;

    const carrierQuick = document.querySelector('[data-quick-nav="carrier"] span');
    const upperQuick = document.querySelector('[data-quick-nav="upper"] span');

    if (carrierQuick) carrierQuick.textContent = carrierLabel;
    if (upperQuick) upperQuick.textContent = upperLabel;

    setFieldLabelText('dashboardUpperHours', upperHoursLabel());
  }


  function linkedPhotoIdsForPoint(pointId, visit = state.activeVisit) {
    if (!pointId || !visit) return [];

    const ids = new Set();

    (visit.photoLibrary || []).forEach(photo => {
      if (!photo?.id) return;

      const linked = Array.isArray(photo.linkedPointIds)
        ? photo.linkedPointIds
        : [];

      if (linked.includes(pointId) || photo.pointId === pointId) {
        ids.add(photo.id);
      }
    });

    // Compatibilité avec les constats déjà existants.
    (visit.findings || []).forEach(finding => {
      if (finding?.pointId !== pointId) return;

      (finding.photos || []).forEach(photo => {
        if (photo?.id) ids.add(photo.id);
      });
    });

    return [...ids];
  }

  function pointHasRequiredPhoto(point, visit = state.activeVisit) {
    if (!point?.photoRequired) return true;
    return linkedPhotoIdsForPoint(point.id, visit).length > 0;
  }

  function linkPhotoToPoint(photo, pointId = state.activePointId) {
    if (!photo || !pointId) return photo;

    const linked = new Set(
      Array.isArray(photo.linkedPointIds)
        ? photo.linkedPointIds
        : []
    );

    linked.add(pointId);
    photo.linkedPointIds = [...linked];

    // Gardé pour compatibilité et lecture simple.
    if (!photo.pointId) photo.pointId = pointId;

    return photo;
  }


 function isPortalPhotoPoint(point) {
  return Boolean(point?.photoRequired);
}
  async function completeRequiredPhotoAndReturnToPortal() {
    const zone = state.requiredPhotoZone || state.activeZone;
    const sectionId = state.requiredPhotoSectionId || state.activeSectionId;

    const section =
      state.activeVisit?.zones?.[zone]?.sections
        ?.find(item => item.id === sectionId) ||
      (
        sectionId === `supplementary-${zone}`
          ? supplementarySection(zone, state.activeVisit)
          : null
      ) ||
      currentSection();

    const requestedPointId =
      state.requiredPhotoPointId ||
      state.activePointId;

    const point = section?.points?.find(item => item.id === requestedPointId);

    if (!point || !isPortalPhotoPoint(point)) return false;

    // Répare automatiquement le contexte si l'utilisateur est arrivé
    // par un ancien chemin de navigation.
    state.requiredPhotoPortalFlow = true;
    state.requiredPhotoPointId = point.id;
    state.requiredPhotoSectionId = section.id;
    state.requiredPhotoZone = zone;

    if (
      !section ||
      !pointHasRequiredPhoto(point) ||
      point.findingId ||
      state.draftFindingId
    ) {
      return false;
    }

    // Le flux photo obligatoire ne doit jamais créer un constat.
    // Dès que la photo existe, le point est traité Conforme.
    clearWholeSectionStatus(section);

    point.status = 'conform';
    point.findingId = null;
    point.neReason = '';
    point.neComment = '';

    recalculateSection(section);
    saveActiveVisit();

    const pointLabel = point.label;

    state.draftPhotos = [];
    state.draftFindingId = null;
    state.originalPhotoIds = [];
    state.removedPhotoIds = [];

    state.requiredPhotoPortalFlow = false;
    state.requiredPhotoPointId = null;
    state.requiredPhotoSectionId = null;
    state.requiredPhotoZone = null;

    state.activePointId = null;

    restoreFindingCriticalityUi();
    clearPhotoObjectUrls();

    $('#cameraPhotoInput').value = '';
    $('#galleryPhotoInput').value = '';

    renderDashboard();
    showScreen('dashboard');

    toast(`${pointLabel} : photo enregistrée · Conforme.`);
    return true;
  }


  function restoreFindingCriticalityUi() {
    const levelField = $('#findingLevel');

    if (levelField) {
      levelField.disabled = false;
      levelField.required = true;

      if (levelField.options?.length) {
        levelField.options[0].textContent =
          levelField.dataset.defaultFirstOption || 'Choisir un niveau...';
      }
    }
  }

  function missingRequiredPhotos(section, visit = state.activeVisit) {
    if (!section) return [];

    return (section.points || []).filter(point =>
      point.photoRequired === true &&
      point.status !== 'na' &&
      point.status !== 'ne' &&
      !pointHasRequiredPhoto(point, visit)
    );
  }

  async function openRequiredPhotoPoint(point, message = '') {
    if (!point) return;

    state.activePointId = point.id;

    const portalFlow = isPortalPhotoPoint(point);

    state.requiredPhotoPortalFlow = portalFlow;
    state.requiredPhotoPointId = portalFlow ? point.id : null;
    state.requiredPhotoSectionId = portalFlow ? state.activeSectionId : null;
    state.requiredPhotoZone = portalFlow ? state.activeZone : null;

    if (message) toast(message);

    await openFindingForm({
      requiredPhotoPortalFlow: portalFlow,
      preserveRequiredPhotoContext: true
    });
  }

  function buildPoints(section) {
    const definitions = Array.isArray(section.pointDefinitions) ? section.pointDefinitions : [];

    return definitions.map((definition, index) => {
      const point = typeof definition === 'string' ? { label: definition } : (definition || {});
      const optional = Boolean(point.optional);
      const defaultStatus = point.defaultStatus === 'na' || optional ? 'na' : 'pending';

      return {
        id: point.id || `${section.id}-${String(index + 1).padStart(3, '0')}`,
        label: point.label || `Point ${index + 1}`,
        optional,
        optionPresent: optional ? false : null,
        defaultStatus,
        sourceNumber: point.sourceNumber ?? null,
        sourceComment: point.sourceComment || '',
        photoRequired: Boolean(point.photoRequired),
        dynamicTest: Boolean(point.dynamicTest),
        plateScope: point.plateScope || '',
        status: defaultStatus,
        findingId: null
      };
    });
  }

  const state = {
    machines: [],
    activeMachine: null,
    activeVisit: null,
    recents: [],
    activeScreen: 'search',
    activeZone: null,
    activeSectionId: null,
    activePointId: null,
    draftPhotos: [],
    draftFindingId: null,
    photoObjectUrls: [],
    originalPhotoIds: [],
    removedPhotoIds: [],
    photoEditor: null,
    initReturnScreen: 'search',
    activeTyrePointId: null,
    visitPhotoLibrarySelection: new Set(),
    libraryPhotoObjectUrls: [],
    requiredPhotoPortalFlow: false,
    requiredPhotoPointId: null,
    requiredPhotoSectionId: null,
    requiredPhotoZone: null,
    photoInputProcessing: false
  };

  const $ = selector => document.querySelector(selector);
  const screens = {};

  function normalize(value = '') {
    return String(value)
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  }

  function escapeHtml(value = '') {
    return String(value).replace(/[&<>'"]/g, char => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
    }[char]));
  }

  function machineKey(machine) {
    return String(machine.id || machine.parkNumber || machine.serialNumber || '').trim();
  }

  function todayIsoDate() {
    const now = new Date();
    const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 10);
  }

  function formatVisitDate(value) {
    if (!value) return '—';
    const [year, month, day] = String(value).split('-');
    return year && month && day ? `${day}/${month}/${year}` : value;
  }

  function formatMeter(value, unit) {
    const number = Number(value);
    if (!Number.isFinite(number)) return '—';
    return `${new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(number)} ${unit}`;
  }

  function hasVisitReadings(visit) {
    return Boolean(visit?.visitDate)
      && Number.isFinite(Number(visit?.carrierKm))
      && Number.isFinite(Number(visit?.carrierHours))
      && Number.isFinite(Number(visit?.upperHours));
  }

  function machineText(machine) {
    return normalize([
      machine.id, machine.parkNumber, machine.rawParkNumber,
      machine.serialNumber, machine.registration, machine.brand,
      machine.model, machine.designation, machine.company,
      machine.agency, machine.agencyCode, machine.city
    ].filter(Boolean).join(' '));
  }

  function searchMachines(query) {
    const q = normalize(query);
    if (!q) return [];
    const compactQ = q.replace(/\s+/g, '');
    return state.machines
      .map(machine => {
        const park = normalize(machine.parkNumber || machine.id).replace(/\s+/g, '');
        const serial = normalize(machine.serialNumber).replace(/\s+/g, '');
        const text = machineText(machine);
        let score = 0;
        if (park === compactQ) score = 100;
        else if (serial && serial === compactQ) score = 95;
        else if (park.startsWith(compactQ)) score = 85;
        else if (serial && serial.startsWith(compactQ)) score = 80;
        else if (text.includes(q)) score = 50;
        return { machine, score };
      })
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score || String(a.machine.parkNumber).localeCompare(String(b.machine.parkNumber), 'fr', { numeric: true }))
      .slice(0, 60)
      .map(item => item.machine);
  }

  async function loadMachines() {
    if (Array.isArray(window.FOSELEV_MACHINES) && window.FOSELEV_MACHINES.length) {
      return window.FOSELEV_MACHINES;
    }
    if (location.protocol === 'file:') {
      throw new Error('Données parc indisponibles. Vérifiez la présence de parc.js.');
    }
    const response = await fetch('./parc.json', { cache: 'no-store' });
    if (!response.ok) throw new Error(`Chargement parc impossible (${response.status})`);
    const data = await response.json();
    if (!Array.isArray(data)) throw new Error('Format parc.json invalide');
    return data;
  }

  const PHOTO_DB = 'foselev_vfg_photos';
  const PHOTO_STORE = 'photos';


  function openPhotoDb() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(PHOTO_DB, 1);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(PHOTO_STORE)) db.createObjectStore(PHOTO_STORE, { keyPath: 'id' });
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error || new Error('Stockage des photos indisponible.'));
    });
  }

async function photoDbPut(record) {
  const db = await openPhotoDb();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(PHOTO_STORE, 'readwrite');

    tx.objectStore(PHOTO_STORE).put(record);

    tx.oncomplete = () => {
      db.close();

      // Sauvegarde locale terminée,
      // puis copie vers le serveur.
      syncPhotoToServer(record);

      resolve();
    };

    tx.onerror = () => {
      db.close();
      reject(tx.error);
    };
  });
}
async function syncPhotoToServer(record, visit = state.activeVisit) {
    if (!SERVER_BASE_URL) {
    return false;
  }
  if (!record?.id || !record?.blob || !visit?.id) return false;

  try {
    const dataUrl = await blobToDataUrl(record.blob);
    const base64 = String(dataUrl).split(',')[1] || '';

    const response = await fetch(
      `${SERVER_BASE_URL}/api/photos/${encodeURIComponent(record.id)}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          visitId: visit.id,
          name: record.name || 'photo.jpg',
          mimeType: record.type || record.blob.type || 'image/jpeg',
          base64
        })
      }
    );

    if (!response.ok) {
      throw new Error(`Erreur serveur photo ${response.status}`);
    }

    console.log('Photo synchronisée avec le serveur :', record.id);
    return true;

  } catch (error) {
    console.warn(
      'Photo conservée localement, synchronisation serveur impossible :',
      error
    );
    return false;
  }
}
async function photoDbGet(id) {
  if (!id) return null;

  // 1 — Recherche locale
  const db = await openPhotoDb();

  const localRecord = await new Promise((resolve, reject) => {
    const tx = db.transaction(PHOTO_STORE, 'readonly');
    const request = tx.objectStore(PHOTO_STORE).get(id);

    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error);

    tx.oncomplete = () => db.close();
  });

  if (localRecord?.blob) {
    return localRecord;
  }

  // 2 — Si absente localement, récupération depuis le serveur
    if (!SERVER_BASE_URL) {
    return null;
  }try {
    const response = await fetch(
      `${SERVER_BASE_URL}/api/photos/${encodeURIComponent(id)}`
    );

    if (!response.ok) {
      console.warn('Photo absente du serveur :', id);
      return null;
    }

    const result = await response.json();
    const serverPhoto = result?.photo;

    if (!serverPhoto?.base64) {
      return null;
    }

    const binary = atob(serverPhoto.base64);
    const bytes = new Uint8Array(binary.length);

    for (let i = 0; i < binary.length; i += 1) {
      bytes[i] = binary.charCodeAt(i);
    }

    const blob = new Blob(
      [bytes],
      { type: serverPhoto.mimeType || 'image/jpeg' }
    );

    const record = {
      id: serverPhoto.id,
      blob,
      type: serverPhoto.mimeType || blob.type,
      name: serverPhoto.name || 'photo.jpg',
      createdAt: serverPhoto.updatedAt || new Date().toISOString()
    };

    // 3 — Mise en cache locale sans rappeler photoDbPut()
    const cacheDb = await openPhotoDb();

    await new Promise((resolve, reject) => {
      const tx = cacheDb.transaction(PHOTO_STORE, 'readwrite');

      tx.objectStore(PHOTO_STORE).put(record);

      tx.oncomplete = () => {
        cacheDb.close();
        resolve();
      };

      tx.onerror = () => {
        cacheDb.close();
        reject(tx.error);
      };
    });

    console.log('Photo récupérée depuis le serveur :', id);

    return record;

  } catch (error) {
    console.warn('Impossible de récupérer la photo :', id, error);
    return null;
  }
}
  function clearPhotoObjectUrls() {
    state.photoObjectUrls.forEach(url => URL.revokeObjectURL(url));
    state.photoObjectUrls = [];
  }

  function blobToImage(blob) {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(blob);
      const image = new Image();
      image.onload = () => { URL.revokeObjectURL(url); resolve(image); };
      image.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Image illisible.')); };
      image.src = url;
    });
  }

  async function optimisePhoto(file) {
    if (!file.type.startsWith('image/')) throw new Error('Le fichier sélectionné n’est pas une image.');
    try {
      const image = await blobToImage(file);
      const maxSide = 1600;
      const ratio = Math.min(1, maxSide / Math.max(image.naturalWidth, image.naturalHeight));
      const width = Math.max(1, Math.round(image.naturalWidth * ratio));
      const height = Math.max(1, Math.round(image.naturalHeight * ratio));
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext('2d');
      context.drawImage(image, 0, 0, width, height);
      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', .82));
      return blob || file;
    } catch (error) {
      console.warn('Compression impossible, original conservé.', error);
      return file;
    }
  }

 async function addSelectedPhotos(files) {
  const selected = Array.from(files || [])
    .filter(file => file.type.startsWith('image/'));

  if (!selected.length || !state.activeVisit) return;

  // Sécurité contre les anciens listeners dupliqués :
  // une seule exécution est autorisée pour une même sélection.
  if (state.photoInputProcessing) return;
  state.photoInputProcessing = true;

  if (!markVisitDraft()) {
    state.photoInputProcessing = false;
    return;
  }

  if (!Array.isArray(state.activeVisit.photoLibrary)) {
    state.activeVisit.photoLibrary = [];
  }

  for (const file of selected) {
    try {
      const blob = await optimisePhoto(file);
      const id = `P-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

      await photoDbPut({
        id,
        blob,
        type: blob.type || file.type,
        name: file.name || 'photo.jpg',
        createdAt: new Date().toISOString()
      });

      const photo = linkPhotoToPoint({
        id,
        name: file.name || 'Photo',
        type: blob.type || file.type,
        createdAt: new Date().toISOString(),
        isMain: false,
        includeInReport: false
      });

      // La photo appartient désormais à toute la visite.
      state.activeVisit.photoLibrary.push({ ...photo });

      // Et elle est également ajoutée à l'anomalie actuellement ouverte.
      state.draftPhotos.push({
        ...photo,
        isMain: state.draftPhotos.length === 0
      });

    } catch (error) {
      console.error(error);
      toast('Une photo n’a pas pu être ajoutée.');
    }
  }

  saveActiveVisit();

  if (await completeRequiredPhotoAndReturnToPortal()) {
    state.photoInputProcessing = false;
    return;
  }

  await renderPhotoGallery();

  $('#cameraPhotoInput').value = '';
  $('#galleryPhotoInput').value = '';

  state.photoInputProcessing = false;

  toast(
    selected.length > 1
      ? `${selected.length} photos ajoutées à la bibliothèque.`
      : 'Photo ajoutée à la bibliothèque.'
  );
}
async function importPhotosToVisitLibrary(files) {
  const selected = Array.from(files || [])
    .filter(file => file.type.startsWith('image/'));

  if (!selected.length || !state.activeVisit) return;
  if (!markVisitDraft()) return;

  if (!Array.isArray(state.activeVisit.photoLibrary)) {
    state.activeVisit.photoLibrary = [];
  }

  let added = 0;

  for (const file of selected) {
    try {
      const blob = await optimisePhoto(file);
      const id = `P-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

      await photoDbPut({
        id,
        blob,
        type: blob.type || file.type,
        name: file.name || 'photo.jpg',
        createdAt: new Date().toISOString()
      });

      state.activeVisit.photoLibrary.push({
        id,
        name: file.name || 'Photo',
        type: blob.type || file.type,
        createdAt: new Date().toISOString(),
        isMain: false,
        includeInReport: false
      });

      added += 1;

    } catch (error) {
      console.error(error);
      toast('Une photo n’a pas pu être importée.');
    }
  }

  saveActiveVisit();

  $('#visitPhotoLibraryInput').value = '';

  await renderVisitPhotoLibrary();

  toast(
    added > 1
      ? `${added} photos importées dans la bibliothèque.`
      : added === 1
        ? 'Photo importée dans la bibliothèque.'
        : 'Aucune photo importée.'
  );
}
  async function renderPhotoGallery() {
    const gallery = $('#photoGallery');
    const empty = $('#photoEmptyState');
    if (!gallery || !empty) return;
    clearPhotoObjectUrls();
    gallery.replaceChildren();
  
    empty.classList.toggle('hidden', state.draftPhotos.length > 0);

    for (const photo of state.draftPhotos) {
      const stored = await photoDbGet(photo.id);
      if (!stored?.blob) continue;

      const url = URL.createObjectURL(stored.blob);
      state.photoObjectUrls.push(url);
      const card = document.createElement('article');
      card.className = `photo-card${photo.isMain ? ' is-main' : ''}${photo.includeInReport ? ' is-report' : ''}`;
      card.innerHTML = `
        <button class="photo-preview" type="button" data-photo-view="${photo.id}" aria-label="Agrandir la photo">
          <img src="${url}" alt="Photo du constat">
          ${photo.isMain ? '<span class="photo-main-badge">Principale</span>' : ''}
          ${photo.includeInReport ? '<span class="photo-report-badge">Rapport</span>' : ''}
        </button>
        <div class="photo-actions">
          <button type="button" data-photo-edit="${photo.id}">✏️<span>Modifier</span></button>
          <button type="button" data-photo-main="${photo.id}" aria-pressed="${photo.isMain}">⭐<span>Principale</span></button>
          <button type="button" data-photo-report="${photo.id}" aria-pressed="${photo.includeInReport}">📄<span>Rapport</span></button>
          <button type="button" class="photo-delete" data-photo-delete="${photo.id}">🗑️<span>Supprimer</span></button>
        </div>`;
      gallery.appendChild(card);
    }
  }
function clearLibraryPhotoObjectUrls() {
  state.libraryPhotoObjectUrls.forEach(url => URL.revokeObjectURL(url));
  state.libraryPhotoObjectUrls = [];
}

async function renderVisitPhotoLibrary() {
  const grid = $('#visitPhotoLibraryGrid');
  const empty = $('#visitPhotoLibraryEmpty');
  const count = $('#visitPhotoLibraryCount');

  if (!grid || !empty || !count) return;

  clearLibraryPhotoObjectUrls();
  grid.replaceChildren();

  const library = state.activeVisit?.photoLibrary || [];

  count.textContent = `${library.length} photo${library.length > 1 ? 's' : ''}`;
  empty.classList.toggle('hidden', library.length > 0);

  for (const photo of library) {
    const stored = await photoDbGet(photo.id);
    if (!stored?.blob) continue;

    const url = URL.createObjectURL(stored.blob);
    state.libraryPhotoObjectUrls.push(url);

    const selected =
      state.visitPhotoLibrarySelection.has(photo.id);

    const card = document.createElement('label');
    card.className = 'photo-card';

    card.innerHTML = `
      <img src="${url}" alt="Photo de la visite">

      <div class="photo-actions">
        <label>
          <input
            type="checkbox"
            data-library-photo="${photo.id}"
            ${selected ? 'checked' : ''}
          >
          Sélectionner
        </label>
      </div>
    `;

    grid.appendChild(card);
  }
}

async function openVisitPhotoLibrary() {
  if (!state.activeVisit) return;

  state.visitPhotoLibrarySelection = new Set();

  // Ouvrir immédiatement la bibliothèque
  $('#visitPhotoLibraryDialog').classList.remove('hidden');
  $('#visitPhotoLibraryDialog').setAttribute('aria-hidden', 'false');

  // Charger ensuite les photos
  await renderVisitPhotoLibrary();
}

function closeVisitPhotoLibrary() {
  $('#visitPhotoLibraryDialog').classList.add('hidden');
  $('#visitPhotoLibraryDialog').setAttribute('aria-hidden', 'true');

  state.visitPhotoLibrarySelection = new Set();

  clearLibraryPhotoObjectUrls();
}

async function addSelectedLibraryPhotos() {
  const library = state.activeVisit?.photoLibrary || [];

  const selectedPhotos = library.filter(photo =>
    state.visitPhotoLibrarySelection.has(photo.id)
  );

  if (!selectedPhotos.length) {
    toast('Sélectionnez au moins une photo.');
    return;
  }

  const alreadyUsed = new Set(
    state.draftPhotos.map(photo => photo.id)
  );

  let added = 0;

  selectedPhotos.forEach(photo => {
    if (alreadyUsed.has(photo.id)) return;

    // La sélection dans la bibliothèque rattache aussi la photo
    // au point actuellement contrôlé.
    const libraryPhoto = (state.activeVisit.photoLibrary || [])
      .find(item => item.id === photo.id);

    if (libraryPhoto) {
      linkPhotoToPoint(libraryPhoto);
    }

    const linkedPhoto = linkPhotoToPoint({ ...photo });

    state.draftPhotos.push({
      ...linkedPhoto,
      isMain: state.draftPhotos.length === 0
        ? true
        : false
    });

    added += 1;
  });

  if (added > 0) saveActiveVisit();

  closeVisitPhotoLibrary();

  if (await completeRequiredPhotoAndReturnToPortal()) {
    return;
  }

  await renderPhotoGallery();

  toast(
    added > 1
      ? `${added} photos ajoutées à l’anomalie.`
      : added === 1
        ? 'Photo ajoutée à l’anomalie.'
        : 'Ces photos sont déjà présentes dans l’anomalie.'
  );
}
  async function viewPhoto(id) {
    const stored = await photoDbGet(id);
    if (!stored?.blob) return toast('Photo introuvable.');
    const url = URL.createObjectURL(stored.blob);
    state.photoObjectUrls.push(url);
    $('#photoViewerImage').src = url;
    $('#photoViewer').classList.remove('hidden');
    $('#photoViewer').setAttribute('aria-hidden', 'false');
  }

  function closePhotoViewer() {
    $('#photoViewer').classList.add('hidden');
    $('#photoViewer').setAttribute('aria-hidden', 'true');
    $('#photoViewerImage').removeAttribute('src');
  }


  function canvasToBlob(canvas, quality = .9) {
    return new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', quality));
  }

  function editorCanvas() { return $('#photoEditorCanvas'); }
  function editorContext() { return editorCanvas().getContext('2d'); }

  function editorSnapshot() {
    const editor = state.photoEditor;
    if (!editor) return;
    const canvas = editorCanvas();
    const snapshot = canvas.toDataURL('image/jpeg', .9);
    if (editor.history[editor.historyIndex] === snapshot) return;
    editor.history = editor.history.slice(0, editor.historyIndex + 1);
    editor.history.push(snapshot);
    editor.historyIndex = editor.history.length - 1;
    updateEditorHistoryButtons();
  }

  function updateEditorHistoryButtons() {
    const editor = state.photoEditor;
    if (!editor) return;
    $('#photoEditorUndo').disabled = editor.historyIndex <= 0;
    $('#photoEditorRedo').disabled = editor.historyIndex >= editor.history.length - 1;
  }

  async function restoreEditorSnapshot(index) {
    const editor = state.photoEditor;
    if (!editor || index < 0 || index >= editor.history.length) return;
    const image = new Image();
    await new Promise((resolve, reject) => {
      image.onload = resolve;
      image.onerror = reject;
      image.src = editor.history[index];
    });
    const canvas = editorCanvas();
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    editorContext().drawImage(image, 0, 0);
    editor.historyIndex = index;
    updateEditorHistoryButtons();
    clearCropSelection();
  }

  function setEditorTool(tool) {
    const editor = state.photoEditor;
    if (!editor) return;
    editor.tool = tool;
    editor.start = null;
    editor.drawing = false;
    document.querySelectorAll('[data-editor-tool]').forEach(button => {
      button.classList.toggle('active', button.dataset.editorTool === tool);
    });
    $('#photoEditorApplyCrop').classList.toggle('hidden', tool !== 'crop');
    $('#photoEditorCanvas').style.touchAction = tool === 'none' ? 'pan-x pan-y' : 'none';
    if (tool !== 'crop') clearCropSelection();
  }

  function canvasPoint(event) {
    const canvas = editorCanvas();
    const rect = canvas.getBoundingClientRect();
    return {
      x: Math.max(0, Math.min(canvas.width, (event.clientX - rect.left) * canvas.width / rect.width)),
      y: Math.max(0, Math.min(canvas.height, (event.clientY - rect.top) * canvas.height / rect.height))
    };
  }

  function clearCropSelection() {
    const editor = state.photoEditor;
    if (editor) editor.crop = null;
    const overlay = $('#photoEditorCropBox');
    overlay.classList.add('hidden');
    overlay.removeAttribute('style');
  }

  function displayCropSelection(start, end) {
    const canvas = editorCanvas();
    const rect = canvas.getBoundingClientRect();
    const left = Math.min(start.x, end.x) / canvas.width * rect.width;
    const top = Math.min(start.y, end.y) / canvas.height * rect.height;
    const width = Math.abs(end.x - start.x) / canvas.width * rect.width;
    const height = Math.abs(end.y - start.y) / canvas.height * rect.height;
    const box = $('#photoEditorCropBox');
    box.classList.remove('hidden');
    box.style.left = `${left}px`;
    box.style.top = `${top}px`;
    box.style.width = `${width}px`;
    box.style.height = `${height}px`;
  }

  function drawArrow(context, start, end) {
    const angle = Math.atan2(end.y - start.y, end.x - start.x);
    const distance = Math.hypot(end.x - start.x, end.y - start.y);
    const head = Math.max(18, Math.min(55, distance * .22));
    context.save();
    context.strokeStyle = '#e00000';
    context.fillStyle = '#e00000';
    context.lineWidth = Math.max(5, editorCanvas().width / 260);
    context.lineCap = 'round';
    context.beginPath(); context.moveTo(start.x, start.y); context.lineTo(end.x, end.y); context.stroke();
    context.beginPath();
    context.moveTo(end.x, end.y);
    context.lineTo(end.x - head * Math.cos(angle - Math.PI / 7), end.y - head * Math.sin(angle - Math.PI / 7));
    context.lineTo(end.x - head * Math.cos(angle + Math.PI / 7), end.y - head * Math.sin(angle + Math.PI / 7));
    context.closePath(); context.fill();
    context.restore();
  }

  function drawEllipse(context, start, end) {
    const cx = (start.x + end.x) / 2;
    const cy = (start.y + end.y) / 2;
    const rx = Math.max(2, Math.abs(end.x - start.x) / 2);
    const ry = Math.max(2, Math.abs(end.y - start.y) / 2);
    context.save();
    context.strokeStyle = '#e00000';
    context.lineWidth = Math.max(5, editorCanvas().width / 260);
    context.beginPath(); context.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2); context.stroke();
    context.restore();
  }

  function renderEditorPreview() {
    const editor = state.photoEditor;
    if (!editor?.previewBase || !editor.start || !editor.current) return;
    const canvas = editorCanvas();
    const context = editorContext();
    context.putImageData(editor.previewBase, 0, 0);
    if (editor.tool === 'arrow') drawArrow(context, editor.start, editor.current);
    if (editor.tool === 'ellipse') drawEllipse(context, editor.start, editor.current);
  }

  function onEditorPointerDown(event) {
    const editor = state.photoEditor;
    if (!editor || editor.tool === 'none') return;
    event.preventDefault();
    editorCanvas().setPointerCapture?.(event.pointerId);
    editor.start = canvasPoint(event);
    editor.current = editor.start;
    editor.drawing = true;
    if (['arrow', 'ellipse'].includes(editor.tool)) editor.previewBase = editorContext().getImageData(0, 0, editorCanvas().width, editorCanvas().height);
    if (editor.tool === 'freehand') {
      const context = editorContext();
      context.save();
      context.strokeStyle = '#e00000';
      context.lineWidth = Math.max(5, editorCanvas().width / 260);
      context.lineCap = 'round'; context.lineJoin = 'round';
      context.beginPath(); context.moveTo(editor.start.x, editor.start.y);
    }
  }

  function onEditorPointerMove(event) {
    const editor = state.photoEditor;
    if (!editor?.drawing) return;
    event.preventDefault();
    editor.current = canvasPoint(event);
    if (['arrow', 'ellipse'].includes(editor.tool)) renderEditorPreview();
    else if (editor.tool === 'freehand') {
      const context = editorContext();
      context.lineTo(editor.current.x, editor.current.y); context.stroke();
    } else if (editor.tool === 'crop') displayCropSelection(editor.start, editor.current);
  }

  function onEditorPointerUp(event) {
    const editor = state.photoEditor;
    if (!editor?.drawing) return;
    event.preventDefault();
    editor.current = canvasPoint(event);
    if (['arrow', 'ellipse'].includes(editor.tool)) {
      renderEditorPreview(); editorSnapshot();
    } else if (editor.tool === 'freehand') {
      editorContext().restore(); editorSnapshot();
    } else if (editor.tool === 'crop') {
      editor.crop = {
        x: Math.round(Math.min(editor.start.x, editor.current.x)),
        y: Math.round(Math.min(editor.start.y, editor.current.y)),
        width: Math.round(Math.abs(editor.current.x - editor.start.x)),
        height: Math.round(Math.abs(editor.current.y - editor.start.y))
      };
      displayCropSelection(editor.start, editor.current);
    }
    editor.drawing = false;
    editor.previewBase = null;
  }

  async function openPhotoEditor(id) {
    const stored = await photoDbGet(id);
    if (!stored?.blob) return toast('Photo introuvable.');
    const image = await blobToImage(stored.blob);
    const canvas = editorCanvas();
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    editorContext().drawImage(image, 0, 0);
    state.photoEditor = { id, tool: 'none', history: [], historyIndex: -1, crop: null, drawing: false };
    editorSnapshot();
    setEditorTool('none');
    $('#photoEditor').classList.remove('hidden');
    $('#photoEditor').setAttribute('aria-hidden', 'false');
    document.body.classList.add('editor-open');
  }

  function closePhotoEditor() {
    $('#photoEditor').classList.add('hidden');
    $('#photoEditor').setAttribute('aria-hidden', 'true');
    document.body.classList.remove('editor-open');
    state.photoEditor = null;
    clearCropSelection();
  }

  function rotateEditor(direction) {
    const source = editorCanvas();
    const temp = document.createElement('canvas');
    temp.width = source.height; temp.height = source.width;
    const context = temp.getContext('2d');
    context.translate(temp.width / 2, temp.height / 2);
    context.rotate(direction * Math.PI / 2);
    context.drawImage(source, -source.width / 2, -source.height / 2);
    source.width = temp.width; source.height = temp.height;
    editorContext().drawImage(temp, 0, 0);
    editorSnapshot();
    clearCropSelection();
  }

  function applyEditorCrop() {
    const editor = state.photoEditor;
    const crop = editor?.crop;
    if (!crop || crop.width < 20 || crop.height < 20) return toast('Tracez d’abord la zone à conserver.');
    const source = editorCanvas();
    const temp = document.createElement('canvas');
    temp.width = crop.width; temp.height = crop.height;
    temp.getContext('2d').drawImage(source, crop.x, crop.y, crop.width, crop.height, 0, 0, crop.width, crop.height);
    source.width = temp.width; source.height = temp.height;
    editorContext().drawImage(temp, 0, 0);
    clearCropSelection(); editorSnapshot(); setEditorTool('none');
  }

  function addEditorText() {
    const value = prompt('Texte à ajouter sur la photo :');
    if (!value) return;
    const canvas = editorCanvas();
    const context = editorContext();
    const fontSize = Math.max(28, Math.round(canvas.width / 18));
    context.save();
    context.font = `bold ${fontSize}px sans-serif`;
    context.textBaseline = 'top';
    const padding = Math.round(fontSize * .25);
    const metrics = context.measureText(value);
    const x = Math.round(canvas.width * .06), y = Math.round(canvas.height * .06);
    context.fillStyle = 'rgba(255,255,255,.88)';
    context.fillRect(x - padding, y - padding, metrics.width + padding * 2, fontSize * 1.25 + padding * 2);
    context.fillStyle = '#e00000';
    context.fillText(value, x, y);
    context.restore();
    editorSnapshot();
  }

  async function savePhotoEditor() {
    const editor = state.photoEditor;
    if (!editor) return;
    if (!markVisitDraft()) return;
    const stored = await photoDbGet(editor.id);
    if (!stored) return toast('Photo introuvable.');
    const blob = await canvasToBlob(editorCanvas(), .9);
    if (!blob) return toast('Enregistrement de la photo impossible.');
    await photoDbPut({ ...stored, originalBlob: stored.originalBlob || stored.blob, blob, editedAt: new Date().toISOString() });
    const metadata = state.draftPhotos.find(photo => photo.id === editor.id);
    if (metadata) metadata.edited = true;
    closePhotoEditor();

    if (await completeRequiredPhotoAndReturnToPortal()) {
      return;
    }

    await renderPhotoGallery();
    toast('Photo modifiée.');
  }

  async function deleteDraftPhoto(id) {
  state.draftPhotos = state.draftPhotos.filter(
    photo => photo.id !== id
  );

  // Mémorise la suppression d'une photo déjà enregistrée
  if (
    state.originalPhotoIds.includes(id) &&
    !state.removedPhotoIds.includes(id)
  ) {
    state.removedPhotoIds.push(id);
  }

  if (
    state.draftPhotos.length &&
    !state.draftPhotos.some(photo => photo.isMain)
  ) {
    state.draftPhotos[0].isMain = true;
  }

  // Une modification a été faite :
  // le bouton Enregistrer doit réapparaître.
  const saveButton = $('#findingSave');

  if (saveButton && state.requiredPhotoPortalFlow) {
    saveButton.classList.remove('hidden');
  }

  await renderPhotoGallery();
}
  async function deleteFindingPhotos(finding) {
  const libraryIds = new Set(
    (state.activeVisit?.photoLibrary || [])
      .map(photo => photo.id)
      .filter(Boolean)
  );

  const orphanPhotoIds = (finding?.photos || [])
    .map(photo => photo.id)
    .filter(id => id && !libraryIds.has(id));

  await Promise.all(
    orphanPhotoIds.map(id =>
      photoDbDelete(id).catch(console.error)
    )
  );
}

  function loadJson(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)); }
    catch { return fallback; }
  }

  function saveJson(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.warn(`Stockage local indisponible pour ${key}:`, error);
      return false;
    }
  }
async function syncVisitToServer(visit) {
    if (!SERVER_BASE_URL) {
    return false;
  }
  if (!visit || !visit.id) return false;

  try {
    const payload = {
      ...visit,
      syncStatus: 'synchronisée'
    };

    const response = await fetch(
      `${SERVER_BASE_URL}/api/visits/${encodeURIComponent(visit.id)}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      }
    );

    if (!response.ok) {
      throw new Error(`Erreur serveur ${response.status}`);
    }

    visit.syncStatus = 'synchronisée';

    persistVisitRecord(visit, {
      touch: false,
      sync: false
    });

    console.log('Visite synchronisée avec le serveur :', visit.id);
    return true;

  } catch (error) {
    visit.syncStatus = 'à synchroniser';

    persistVisitRecord(visit, {
      touch: false,
      sync: false
    });

    console.warn(
      'Serveur local indisponible, visite conservée localement :',
      error
    );

    return false;
  }
}
async function deleteVisitFromServer(visitId) {
    if (!SERVER_BASE_URL) {
    return false;
  }
  if (!visitId) return false;

  try {
    const response = await fetch(
    `${SERVER_BASE_URL}/api/visits/${encodeURIComponent(visitId)}`,
      {
        method: 'DELETE'
      }
    );

    if (!response.ok) {
      throw new Error(`Erreur serveur ${response.status}`);
    }

    console.log('Visite supprimée du serveur :', visitId);
    return true;

  } catch (error) {
    console.warn('Suppression serveur impossible :', error);
    return false;
  }
}
  function loadRecents() {
    state.recents = loadJson(STORAGE_KEYS.recents, []);
  }
async function loadVisitsFromServer() {
    if (!SERVER_BASE_URL) {
    return [];
  }
  try {
    const response = await fetch(
     `${SERVER_BASE_URL}/api/visits`,
      { cache: 'no-store' }
    );

    if (!response.ok) {
      throw new Error(`Erreur serveur ${response.status}`);
    }

    const data = await response.json();
    const serverVisits = Array.isArray(data.visits) ? data.visits : [];
    const localVisits = loadJson(STORAGE_KEYS.visits, []);

    const mergedById = new Map();

    localVisits.forEach(visit => {
      if (visit?.id) mergedById.set(visit.id, visit);
    });

    serverVisits.forEach(serverVisit => {
      if (!serverVisit?.id) return;

      const localVisit = mergedById.get(serverVisit.id);

      if (!localVisit) {
        mergedById.set(serverVisit.id, serverVisit);
        return;
      }

      const localDate = new Date(
        localVisit.updatedAt || localVisit.createdAt || 0
      ).getTime();

      const serverDate = new Date(
        serverVisit.updatedAt || serverVisit.createdAt || 0
      ).getTime();

      if (serverDate >= localDate) {
        mergedById.set(serverVisit.id, serverVisit);
      }
    });

    const mergedVisits = Array.from(mergedById.values())
      .sort((a, b) =>
        new Date(b.updatedAt || b.createdAt || 0) -
        new Date(a.updatedAt || a.createdAt || 0)
      );

    saveJson(STORAGE_KEYS.visits, mergedVisits);

    console.log(
      `${serverVisits.length} visite(s) chargée(s) depuis SQLite`
    );

    return true;

  } catch (error) {
    console.warn(
      'SQLite indisponible, utilisation des visites locales :',
      error
    );

    return false;
  }
}
async function loadVisitsFromServer() {
    if (!SERVER_BASE_URL) {
    return [];
  }
  try {
  const response = await fetch(
  `${SERVER_BASE_URL}/api/visits`
);

    if (!response.ok) {
      throw new Error(`Erreur serveur ${response.status}`);
    }

    const data = await response.json();
    const serverVisits = Array.isArray(data.visits) ? data.visits : [];
    const localVisits = loadJson(STORAGE_KEYS.visits, []);

    const mergedById = new Map();

    localVisits.forEach(visit => {
      if (visit?.id) mergedById.set(visit.id, visit);
    });

    serverVisits.forEach(serverVisit => {
      if (!serverVisit?.id) return;

      const localVisit = mergedById.get(serverVisit.id);

      if (!localVisit) {
        mergedById.set(serverVisit.id, serverVisit);
        return;
      }

      const localDate = new Date(
        localVisit.updatedAt || localVisit.createdAt || 0
      ).getTime();

      const serverDate = new Date(
        serverVisit.updatedAt || serverVisit.createdAt || 0
      ).getTime();

      if (serverDate >= localDate) {
        mergedById.set(serverVisit.id, serverVisit);
      }
    });

    const mergedVisits = Array.from(mergedById.values())
      .sort((a, b) =>
        new Date(b.updatedAt || b.createdAt || 0) -
        new Date(a.updatedAt || a.createdAt || 0)
      );

    saveJson(STORAGE_KEYS.visits, mergedVisits);

    console.log(
      `${serverVisits.length} visite(s) chargée(s) depuis SQLite`
    );

    return true;

  } catch (error) {
    console.warn(
      'SQLite indisponible, utilisation des visites locales :',
      error
    );

    return false;
  }
}
  function rememberMachine(machine) {
    const summary = {
      id: machineKey(machine),
      parkNumber: machine.parkNumber || machine.id,
      brand: machine.brand || '',
      model: machine.model || '',
      designation: machine.designation || '',
      serialNumber: machine.serialNumber || '',
      agency: machine.agency || '',
      category: machine.category || ''
    };
    state.recents = [summary, ...state.recents.filter(item => machineKey(item) !== summary.id)].slice(0, 10);
    saveJson(STORAGE_KEYS.recents, state.recents);
    saveJson(STORAGE_KEYS.activeMachine, summary);
    renderCompactRecentMachines();
  }

  function clearRecents() {
    state.recents = [];
    localStorage.removeItem(STORAGE_KEYS.recents);
  }


  function createSections(zone, machine = state.activeMachine, visit = state.activeVisit) {
    const profile = familyReferential(machine || {}, visit || null);
    const sections = Array.isArray(profile[zone]) ? profile[zone] : [];

    return sections.map(definition => {
      const section = {
        id: definition.id,
        label: definition.label,
        pointDefinitions: Array.isArray(definition.points) ? definition.points : [],
        total: 0,
        remaining: 0,
        ncOpen: 0,
        ncTotal: 0,
        naTotal: 0
      };

      section.points = buildPoints(section);
      section.optionalEquipment =
        section.points.length > 0 &&
        section.points.every(point => point.optional === true);
      section.optionPresent = section.optionalEquipment ? false : null;

      recalculateSection(section);
      return section;
    });
  }


  const TYRE_STATES = ['pending', '100', '75', '50', '25', 'HS'];

  function inferAxleCount(machine) {
    const source = `${machine?.model || ''} ${machine?.designation || ''}`;
    const modelMatch = source.match(/-(\d)(?:\.|\b)/);
    if (modelMatch) return Math.min(9, Math.max(2, Number(modelMatch[1])));
    const axleMatch = source.match(/(\d+)\s*essieux?/i);
    if (axleMatch) return Math.min(9, Math.max(2, Number(axleMatch[1])));
    return 5;
  }

  function tyrePositionLabel(axleIndex, side, position) {
    const sideLabel = side === 'left' ? 'gauche' : 'droit';
    const posLabel = position === 'inner' ? 'intérieur' : position === 'outer' ? 'extérieur' : '';
    return `Essieu ${axleIndex + 1} · pneu ${posLabel ? posLabel + ' ' : ''}${sideLabel}`;
  }

  function tyrePointId(axleIndex, side, position) {
    return `tyres-a${axleIndex + 1}-${side}-${position}`;
  }

  function tyrePositions(mode) {
    return mode === 'dual' ? ['outer', 'inner'] : ['single'];
  }

  function createTyreData(machine, axleCount = inferAxleCount(machine)) {
    return {
      axleCount,
      axles: Array.from({ length: axleCount }, (_, index) => ({
        index,
        mode: 'single',
        tyres: ['left', 'right'].flatMap(side => tyrePositions('single').map(position => ({
          id: tyrePointId(index, side, position), side, position, value: 'pending', findingId: null
        })))
      }))
    };
  }

  function ensureTyreData(visit, machine) {
    if (!visit.tyres || typeof visit.tyres !== 'object') visit.tyres = createTyreData(machine);
    let axleCount = Number(visit.tyres.axleCount || inferAxleCount(machine));
    axleCount = Math.min(9, Math.max(2, axleCount));
    const oldAxles = Array.isArray(visit.tyres.axles) ? visit.tyres.axles : [];
    visit.tyres.axleCount = axleCount;
    visit.tyres.axles = Array.from({ length: axleCount }, (_, index) => {
      const old = oldAxles[index] || {};
      const mode = old.mode === 'dual' ? 'dual' : 'single';
      const oldTyres = new Map((old.tyres || []).map(t => [t.id, t]));
      const tyres = ['left', 'right'].flatMap(side => tyrePositions(mode).map(position => {
        const id = tyrePointId(index, side, position);
        const previous = oldTyres.get(id);
        return { id, side, position, value: TYRE_STATES.includes(previous?.value) ? previous.value : 'pending', findingId: previous?.findingId || null };
      }));
      return { index, mode, tyres };
    });
    syncTyreSection(visit);
    return visit.tyres;
  }

  function tyreValueToPointStatus(value) {
    if (value === 'pending') return 'pending';
    if (value === 'HS') return 'finding';
    return 'conform';
  }

  function syncTyreSection(visit = state.activeVisit) {
    if (!visit?.tyres) return;
    const section = visit.zones?.carrier?.sections?.find(item => item.id === 'tyres');
    if (!section) return;
    const existing = new Map((section.points || []).map(p => [p.id, p]));
    section.points = visit.tyres.axles.flatMap((axle, axleIndex) => axle.tyres.map(tyre => {
      const old = existing.get(tyre.id) || {};
      return {
        id: tyre.id,
        label: tyrePositionLabel(axleIndex, tyre.side, tyre.position),
        status: section.wholeNa === true
          ? 'na'
          : section.wholeNe === true
            ? 'ne'
            : tyreValueToPointStatus(tyre.value),
        findingId: (section.wholeNa === true || section.wholeNe === true)
          ? null
          : (tyre.findingId || old.findingId || null),
        tyreValue: tyre.value,
        defaultStatus: 'pending',
        optional: false
      };
    }));
    recalculateSection(section);
  }

  function findTyre(pointId) {
    for (const axle of state.activeVisit?.tyres?.axles || []) {
      const tyre = axle.tyres.find(item => item.id === pointId);
      if (tyre) return tyre;
    }
    return null;
  }

  function createVisit(machine) {
    const now = new Date().toISOString();
    const detectedMk = String(machine.category || '').toUpperCase() === 'GM' && machineLooksLikeMk(machine);

    const visit = {
      id: `V4-${machineKey(machine)}-${Date.now()}`,
      machineId: machineKey(machine),
      machineSnapshot: {
        id: machineKey(machine),
        parkNumber: machine.parkNumber || machine.id || '',
        serialNumber: machine.serialNumber || '',
        brand: machine.brand || '',
        model: machine.model || machine.designation || '',
        designation: machine.designation || '',
        agency: machine.agency || '',
        category: machine.category || ''
      },
      status: 'Brouillon',
      createdAt: now,
      updatedAt: now,
      visitDate: todayIsoDate(),
      carrierKm: null,
      carrierHours: null,
      upperHours: null,
      controllerName: '',
      controllerEmail: '',
      controllerPhone: '',
      referentialVersion: REFERENTIAL_VERSION,
      mkMode: detectedMk,
      craneFamily: String(machine.category || '').toUpperCase() === 'MK'
        ? 'MK'
        : detectedMk
          ? 'MK'
          : 'GM',
      craneFamilyLocked: String(machine.category || '').toUpperCase() === 'MK',
      craneFamilyLockedAt: String(machine.category || '').toUpperCase() === 'MK'
        ? now
        : null,
      family: detectedMk ? 'MK' : machineFamily(machine),
      workflowVersion: 'POINT2-FINAL',
      specialCasesVersion: 'POINT3.6.4',
      syncVersion: 'POINT4.1',
      cbEquipment: {
        brand: '',
        type: '',
        serialNumber: ''
      },
      cnEquipment: {
        brand: '',
        type: '',
        serialNumber: ''
      },
      scope: { carrier: true, upper: true },
      zones: {
        carrier: { sections: [] },
        upper: { sections: [] }
      },
      supplementaryControls: {
        carrier: {
          id: 'supplementary-carrier',
          label: 'Contrôle supplémentaire',
          supplementary: true,
          points: [],
          total: 0,
          remaining: 0,
          ncOpen: 0,
          ncTotal: 0,
          naTotal: 0
        },
        upper: {
          id: 'supplementary-upper',
          label: 'Contrôle supplémentaire',
          supplementary: true,
          points: [],
          total: 0,
          remaining: 0,
          ncOpen: 0,
          ncTotal: 0,
          naTotal: 0
        }
      },
      photoLibrary: [],
      findings: [],
      tyres: createTyreData(machine)
    };

    visit.zones.carrier.sections = createSections('carrier', machine, visit);
    visit.zones.upper.sections = createSections('upper', machine, visit);
    syncTyreSection(visit);

    return visit;
  }

  function ensureVisitSchema(visit, machine) {
    let changed = false;

    if (!visit || typeof visit !== 'object') {
      return { visit: createVisit(machine), changed: true };
    }

    const previousReferentialVersion = visit.referentialVersion || '';
    const migratingReferential = previousReferentialVersion !== REFERENTIAL_VERSION;

    if (!visit.machineId) {
      visit.machineId = machineKey(machine);
      changed = true;
    }

    if (!visit.machineSnapshot || typeof visit.machineSnapshot !== 'object') {
      visit.machineSnapshot = createVisit(machine).machineSnapshot;
      changed = true;
    }

    const existingControlled = visitHasStarted(visit);

    if (visit.craneFamily !== 'GM' && visit.craneFamily !== 'MK') {
      const category = String(machine.category || '').toUpperCase();

      if (category === 'MK') {
        visit.craneFamily = 'MK';
      } else if (category === 'GM') {
        visit.craneFamily = visit.mkMode === true || machineLooksLikeMk(machine)
          ? 'MK'
          : 'GM';
      }

      if (visit.craneFamily) changed = true;
    }

    if (String(machine.category || '').toUpperCase() === 'MK') {
      if (visit.craneFamily !== 'MK') {
        visit.craneFamily = 'MK';
        changed = true;
      }

      if (visit.craneFamilyLocked !== true) {
        visit.craneFamilyLocked = true;
        changed = true;
      }

      if (!visit.craneFamilyLockedAt) {
        visit.craneFamilyLockedAt = visit.createdAt || new Date().toISOString();
        changed = true;
      }
    } else if (existingControlled && ['GM', 'MK'].includes(visit.craneFamily)) {
      if (visit.craneFamilyLocked !== true) {
        visit.craneFamilyLocked = true;
        changed = true;
      }

      if (!visit.craneFamilyLockedAt) {
        visit.craneFamilyLockedAt = visit.updatedAt || new Date().toISOString();
        changed = true;
      }
    }

    if (typeof visit.mkMode !== 'boolean') {
      visit.mkMode = String(machine.category || '').toUpperCase() === 'GM' && machineLooksLikeMk(machine);
      changed = true;
    } else if (
      migratingReferential &&
      !existingControlled &&
      String(machine.category || '').toUpperCase() === 'GM' &&
      machineLooksLikeMk(machine)
    ) {
      visit.mkMode = true;
      changed = true;
    }

    if (visit.craneFamily === 'GM' || visit.craneFamily === 'MK') {
      const expectedMkMode = visit.craneFamily === 'MK';

      if (visit.mkMode !== expectedMkMode) {
        visit.mkMode = expectedMkMode;
        changed = true;
      }
    }

    if (visit.referentialVersion !== REFERENTIAL_VERSION) {
      visit.referentialVersion = REFERENTIAL_VERSION;
      changed = true;
    }

    const resolvedFamily = machineFamily(machine, visit);
    if (visit.family !== resolvedFamily) {
      visit.family = resolvedFamily;
      changed = true;
    }

    const previousScope = JSON.stringify(visit.scope || null);
    ensureVisitScope(visit, machine);
    if (JSON.stringify(visit.scope) !== previousScope) {
      changed = true;
    }

    if (visit.workflowVersion !== 'POINT2-FINAL') {
      visit.workflowVersion = 'POINT2-FINAL';
      changed = true;
    }

    if (visit.specialCasesVersion !== 'POINT3.6.4') {
      visit.specialCasesVersion = 'POINT3.6.4';
      changed = true;
    }

    if (visit.syncVersion !== 'POINT4.1') {
      visit.syncVersion = 'POINT4.1';
      changed = true;
    }

    if (!visit.cbEquipment || typeof visit.cbEquipment !== 'object') {
      visit.cbEquipment = {
        brand: '',
        type: '',
        serialNumber: ''
      };
      changed = true;
    } else {
      for (const field of ['brand', 'type', 'serialNumber']) {
        if (typeof visit.cbEquipment[field] !== 'string') {
          visit.cbEquipment[field] = '';
          changed = true;
        }
      }
    }

    if (!visit.cnEquipment || typeof visit.cnEquipment !== 'object') {
      visit.cnEquipment = {
        brand: '',
        type: '',
        serialNumber: ''
      };
      changed = true;
    } else {
      for (const field of ['brand', 'type', 'serialNumber']) {
        if (typeof visit.cnEquipment[field] !== 'string') {
          visit.cnEquipment[field] = '';
          changed = true;
        }
      }
    }

    if (!visit.supplementaryControls || typeof visit.supplementaryControls !== 'object') {
      visit.supplementaryControls = {};
      changed = true;
    }

    for (const zone of ['carrier', 'upper']) {
      const expectedId = `supplementary-${zone}`;
      let section = visit.supplementaryControls[zone];

      if (!section || typeof section !== 'object') {
        section = {
          id: expectedId,
          label: 'Contrôle supplémentaire',
          supplementary: true,
          points: [],
          total: 0,
          remaining: 0,
          ncOpen: 0,
          ncTotal: 0,
          naTotal: 0
        };
        visit.supplementaryControls[zone] = section;
        changed = true;
      }

      if (section.id !== expectedId) {
        section.id = expectedId;
        changed = true;
      }

      if (section.label !== 'Contrôle supplémentaire') {
        section.label = 'Contrôle supplémentaire';
        changed = true;
      }

      if (section.supplementary !== true) {
        section.supplementary = true;
        changed = true;
      }

      if (!Array.isArray(section.points)) {
        section.points = [];
        changed = true;
      }

      section.points = section.points.map((point, index) => {
        const normalized = {
          id: point?.id || `SUP-${zone}-${Date.now()}-${index}`,
          label: String(point?.label || `Contrôle supplémentaire ${index + 1}`).trim(),
          status: ['pending', 'conform', 'finding', 'na', 'ne'].includes(point?.status)
            ? point.status
            : 'pending',
          findingId: point?.findingId || null,
          neReason: point?.neReason || '',
          neComment: point?.neComment || '',
          defaultStatus: 'pending',
          optional: false,
          supplementary: true,
          countInVisitTotal: true,
          photoRequired: false,
          createdAt: point?.createdAt || visit.createdAt || new Date().toISOString()
        };

        if (
          !point ||
          point.supplementary !== true ||
          point.defaultStatus !== 'pending' ||
          point.optional !== false
        ) {
          changed = true;
        }

        return normalized;
      });

      recalculateSection(section);
    }

    const controllerProfile = loadJson(STORAGE_KEYS.controllerProfile, {});
    for (const [field, fallback] of [
      ['controllerName', controllerProfile.name || ''],
      ['controllerEmail', controllerProfile.email || ''],
      ['controllerPhone', controllerProfile.phone || '']
    ]) {
      if (typeof visit[field] !== 'string') {
        visit[field] = fallback;
        changed = true;
      }
    }

    if (!visit.zones || typeof visit.zones !== 'object') {
      visit.zones = {};
      changed = true;
    }

    for (const zone of ['carrier', 'upper']) {
      const defaults = createSections(zone, machine, visit);

      if (!visit.zones[zone] || typeof visit.zones[zone] !== 'object') {
        visit.zones[zone] = { sections: defaults };
        changed = true;
        continue;
      }

      if (!Array.isArray(visit.zones[zone].sections) || visit.zones[zone].sections.length === 0) {
        visit.zones[zone].sections = defaults;
        changed = true;
        continue;
      }

      const existingById = new Map(visit.zones[zone].sections.map(section => [section.id, section]));
      const merged = defaults.map(defaultSection => {
        const existing = existingById.get(defaultSection.id);
        if (!existing) {
          changed = true;
          return defaultSection;
        }

        const mergedSection = {
          ...defaultSection,
          ...existing,
          pointDefinitions: defaultSection.pointDefinitions,
          total: Number(existing.total ?? defaultSection.total),
          remaining: Number(existing.remaining ?? existing.total ?? defaultSection.total),
          ncOpen: Number(existing.ncOpen || 0),
          ncTotal: Number(existing.ncTotal || 0),
          naTotal: Number(existing.naTotal || 0)
        };

        const fresh = buildPoints(mergedSection);
        const existingRealPoints = Array.isArray(existing.points)
          ? existing.points.filter(point => point?.label && !/—\s*contr[oô]le\s+\d+$/i.test(point.label))
          : [];
        const existingByLabel = new Map(existingRealPoints.map(point => [normalize(point.label), point]));

        mergedSection.points = fresh.map((point, index) => {
          const previous = existingByLabel.get(normalize(point.label)) || existingRealPoints[index];
          let status = point.status;

          if (previous && ['pending', 'conform', 'finding', 'na', 'ne'].includes(previous.status)) {
            status = previous.status;

            // Lors de la première migration vers le référentiel métier,
            // une option encore non contrôlée doit bien démarrer en N/A.
            if (migratingReferential && point.optional && previous.status === 'pending') {
              status = 'na';
            }
          }

          const optionPresent = point.optional
            ? (
                typeof previous?.optionPresent === 'boolean'
                  ? previous.optionPresent
                  : (
                      previous &&
                      !existing.wholeNa &&
                      !existing.wholeNe &&
                      previous.status !== 'na'
                    )
            )
            : null;

          return {
            ...point,
            status,
            optionPresent,
            findingId: previous?.findingId || null,
            neReason: previous?.neReason || '',
            neComment: previous?.neComment || ''
          };
        });

        mergedSection.optionalEquipment =
          mergedSection.points.length > 0 &&
          mergedSection.points.every(point => point.optional === true);

        if (mergedSection.optionalEquipment) {
          if (typeof existing.optionPresent === 'boolean') {
            mergedSection.optionPresent = existing.optionPresent;
          } else {
            mergedSection.optionPresent =
              !existing.wholeNa &&
              !existing.wholeNe &&
              mergedSection.points.some(point =>
                point.status !== 'na' || point.optionPresent === true
              );
            changed = true;
          }

          // Une rubrique optionnelle absente reste entièrement N/A.
          if (mergedSection.optionPresent !== true && !mergedSection.wholeNe) {
            mergedSection.points.forEach(point => {
              point.status = 'na';
              point.optionPresent = false;
              point.findingId = null;
              point.neReason = '';
              point.neComment = '';
            });
          } else if (mergedSection.optionPresent === true && !mergedSection.wholeNa && !mergedSection.wholeNe) {
            // Si l'équipement est déclaré présent, les anciens N/A automatiques
            // redeviennent des points à contrôler.
            mergedSection.points.forEach(point => {
              point.optionPresent = true;
              if (point.status === 'na' && point.defaultStatus === 'na') {
                point.status = 'pending';
              }
            });
          }
        }

        recalculateSection(mergedSection);


        if (
          migratingReferential ||
          !Array.isArray(existing.points) ||
          existing.points.length !== mergedSection.points.length ||
          existing.points.some(point => /—\s*contr[oô]le\s+\d+$/i.test(point?.label || ''))
        ) {
          changed = true;
        }

        recalculateSection(mergedSection);
        return mergedSection;
      });

      if (merged.length !== visit.zones[zone].sections.length) changed = true;
      visit.zones[zone].sections = merged;
    }

    ensureTyreData(visit, machine);

    if (!Array.isArray(visit.findings)) {
      visit.findings = [];
      changed = true;
    }

    if (!Array.isArray(visit.photoLibrary)) {
      visit.photoLibrary = [];
      const knownPhotoIds = new Set();

      (visit.findings || []).forEach(finding => {
        (finding.photos || []).forEach(photo => {
          if (!photo?.id || knownPhotoIds.has(photo.id)) return;
          knownPhotoIds.add(photo.id);
          visit.photoLibrary.push({ ...photo });
        });
      });

      changed = true;
    }

    visit.findings.forEach(finding => {
      if (!Array.isArray(finding.photos)) {
        finding.photos = [];
        changed = true;
      }

      (finding.photos || []).forEach(findingPhoto => {
        if (!findingPhoto?.id || !finding?.pointId) return;

        const libraryPhoto = visit.photoLibrary.find(photo => photo.id === findingPhoto.id);
        if (!libraryPhoto) return;

        const linked = new Set(
          Array.isArray(libraryPhoto.linkedPointIds)
            ? libraryPhoto.linkedPointIds
            : []
        );

        if (!linked.has(finding.pointId)) {
          linked.add(finding.pointId);
          libraryPhoto.linkedPointIds = [...linked];
          if (!libraryPhoto.pointId) libraryPhoto.pointId = finding.pointId;
          changed = true;
        }
      });
    });

    if (!visit.visitDate) {
      visit.visitDate = todayIsoDate();
      changed = true;
    }

    for (const field of ['carrierKm', 'carrierHours', 'upperHours']) {
      if (!(field in visit)) {
        visit[field] = null;
        changed = true;
      }
    }

    if (!['Brouillon', 'Terminée', 'Synchronisée'].includes(visit.status)) {
      visit.status = 'Brouillon';
      changed = true;
    }

    if (!visit.updatedAt) {
      visit.updatedAt = new Date().toISOString();
      changed = true;
    }

    return { visit, changed };
  }

  function recalculateSection(section) {
    if (!Array.isArray(section.points)) section.points = buildPoints(section);

    const applicable = section.points.filter(point => point.status !== 'na');
    section.total = applicable.length;
    section.remaining = applicable.filter(point => point.status === 'pending').length;
    section.ncTotal = applicable.filter(point => point.status === 'finding').length;
    section.ncOpen = section.ncTotal;
    section.naTotal = section.points.filter(point => point.status === 'na').length;
    section.neTotal = section.points.filter(point => point.status === 'ne').length;
    return section;
  }


  function supplementarySection(
    zone = state.activeZone,
    visit = state.activeVisit
  ) {
    if (!visit || !['carrier', 'upper'].includes(zone)) return null;

    if (!visit.supplementaryControls || typeof visit.supplementaryControls !== 'object') {
      visit.supplementaryControls = {};
    }

    if (!visit.supplementaryControls[zone]) {
      visit.supplementaryControls[zone] = {
        id: `supplementary-${zone}`,
        label: 'Contrôle supplémentaire',
        supplementary: true,
        points: [],
        total: 0,
        remaining: 0,
        ncOpen: 0,
        ncTotal: 0,
        naTotal: 0
      };
    }

    const section = visit.supplementaryControls[zone];
    section.supplementary = true;
    section.label = 'Contrôle supplémentaire';
    section.id = `supplementary-${zone}`;

    if (!Array.isArray(section.points)) section.points = [];

    recalculateSection(section);
    return section;
  }

  function isSupplementarySection(section) {
    return section?.supplementary === true ||
      /^supplementary-(carrier|upper)$/.test(section?.id || '');
  }

  function supplementaryProgress(
    visit = state.activeVisit,
    zone = null
  ) {
    const zones = zone ? [zone] : ['carrier', 'upper'];

    return zones.reduce((summary, currentZone) => {
      if (!zoneEnabled(visit, currentZone)) return summary;

      const section = supplementarySection(currentZone, visit);
      const progress = sectionProgress(section);

      summary.remaining += Number(progress.remaining || 0);
      summary.total += Number(progress.total || 0);
      summary.controlled += Number(progress.controlled || 0);
      summary.ncTotal += Number(section.ncTotal || 0);

      return summary;
    }, {
      remaining: 0,
      total: 0,
      controlled: 0,
      ncTotal: 0
    });
  }

  function supplementaryPointLabel(point) {
    return String(point?.label || '').trim();
  }

  function addSupplementaryControl(zone = state.activeZone) {
    if (!markVisitDraft()) return;

    const input = $('#supplementaryControlInput');
    const label = String(input?.value || '').trim();

    if (!label) {
      toast('Saisissez l’intitulé du contrôle supplémentaire.');
      input?.focus();
      return;
    }

    const section = supplementarySection(zone);

    const point = {
      id: `SUP-${zone}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      label,
      status: 'pending',
      findingId: null,
      neReason: '',
      neComment: '',
      defaultStatus: 'pending',
      optional: false,
      supplementary: true,
      countInVisitTotal: true,
      photoRequired: false,
      createdAt: new Date().toISOString()
    };

    section.points.push(point);
    recalculateSection(section);
    saveActiveVisit();

    if (input) input.value = '';

    state.activeZone = zone;
    state.activeSectionId = section.id;
    renderInspection();
    showScreen('inspection');

    setTimeout(() => {
      const row = document.querySelector(
        `[data-point-finding="${CSS.escape(point.id)}"]`
      );
      row?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 0);

    toast('Contrôle supplémentaire ajouté.');
  }

  function editSupplementaryControl(pointId) {
    const section = currentSection();
    if (!isSupplementarySection(section)) return;

    const point = section.points.find(item => item.id === pointId);
    if (!point) return;

    const next = prompt(
      'Modifier l’intitulé du contrôle supplémentaire :',
      point.label
    );

    if (next === null) return;

    const label = String(next).trim();

    if (!label) {
      toast('L’intitulé du contrôle ne peut pas être vide.');
      return;
    }

    if (!markVisitDraft()) return;

    point.label = label;

    const finding = point.findingId
      ? (state.activeVisit.findings || []).find(item => item.id === point.findingId)
      : null;

    if (finding) {
      finding.pointLabel = label;
      finding.title = label;
      finding.updatedAt = new Date().toISOString();
    }

    recalculateSection(section);
    saveActiveVisit();
    renderInspection();

    toast('Intitulé du contrôle supplémentaire modifié.');
  }

  async function deleteSupplementaryControl(pointId) {
    const section = currentSection();
    if (!isSupplementarySection(section)) return;

    const point = section.points.find(item => item.id === pointId);
    if (!point) return;

    const confirmed = confirm(
      `Supprimer le contrôle supplémentaire « ${point.label} » ?` +
      (point.findingId ? '\n\nLe constat et ses photos associés seront également supprimés.' : '')
    );

    if (!confirmed) return;
    if (!markVisitDraft()) return;

    if (point.findingId) {
      const finding = (state.activeVisit.findings || [])
        .find(item => item.id === point.findingId);

      await deleteFindingPhotos(finding);

      state.activeVisit.findings = (state.activeVisit.findings || [])
        .filter(item => item.id !== point.findingId);
    }

    section.points = section.points.filter(item => item.id !== pointId);
    recalculateSection(section);
    saveActiveVisit();
    renderInspection();

    toast('Contrôle supplémentaire supprimé.');
  }

  function openSupplementaryControls(zone = state.activeZone) {
    if (!zoneEnabled(state.activeVisit, zone)) return;

    state.activeZone = zone;
    const section = supplementarySection(zone);
    state.activeSectionId = section.id;
    state.activePointId = null;

    renderInspection();
    showScreen('inspection');
  }

  function currentSection() {
    const standard = state.activeVisit?.zones?.[state.activeZone]?.sections
      ?.find(section => section.id === state.activeSectionId);

    if (standard) return standard;

    const supplementary = supplementarySection(
      state.activeZone,
      state.activeVisit
    );

    return supplementary?.id === state.activeSectionId
      ? supplementary
      : null;
  }

  function visitSortValue(visit) {
    const value = visit?.updatedAt || visit?.createdAt || visit?.visitDate || '';
    const time = Date.parse(value);
    return Number.isFinite(time) ? time : 0;
  }

  function machineVisits(machine) {
    const id = machineKey(machine);
    return loadJson(STORAGE_KEYS.visits, [])
      .filter(item => item.machineId === id || item.machineSnapshot?.id === id || item.machineSnapshot?.parkNumber === id)
      .sort((a, b) => visitSortValue(b) - visitSortValue(a));
  }

  function getOrCreateVisit(machine) {
    const visits = loadJson(STORAGE_KEYS.visits, []);
    const id = machineKey(machine);
    const related = visits
      .filter(item => item.machineId === id || item.machineSnapshot?.id === id || item.machineSnapshot?.parkNumber === id)
      .sort((a, b) => visitSortValue(b) - visitSortValue(a));

    let visit = related.find(item => item.status === 'Brouillon' || item.status === 'En cours');

    if (!visit && related.length) {
      const latest = related[0];
      const dateLabel = formatVisitDate(latest.visitDate);
      const controller = latest.controllerName ? ` par ${latest.controllerName}` : '';
      const reopen = confirm(`Dernière visite terminée le ${dateLabel}${controller}.\n\nOK : rouvrir cette visite\nAnnuler : créer une nouvelle visite`);
      visit = reopen ? latest : createVisit(machine);
      if (!reopen) {
        visits.unshift(visit);
        saveJson(STORAGE_KEYS.visits, visits);
        syncVisitToServer(visit);
        return visit;
      }
    }

    if (!visit) {
      visit = createVisit(machine);
      visits.unshift(visit);
      saveJson(STORAGE_KEYS.visits, visits);
      syncVisitToServer(visit);
      return visit;
    }

    const migrated = ensureVisitSchema(visit, machine);
    visit = migrated.visit;

    if (migrated.changed) {
      visit.updatedAt = new Date().toISOString();
      const index = visits.findIndex(item => item.id === visit.id);
      if (index >= 0) visits[index] = visit;
      else visits.unshift(visit);
      saveJson(STORAGE_KEYS.visits, visits);
    }

    return visit;
  }

  function standardZoneProgress(visit, zone) {
    if (!zoneEnabled(visit, zone)) {
      return { remaining: 0, total: 0, ncOpen: 0, ncTotal: 0, neTotal: 0 };
    }

    const sections = visit?.zones?.[zone]?.sections || [];

    return sections.reduce((summary, section) => {
      summary.remaining += Number(section.remaining ?? section.total ?? 0);
      summary.total += Number(section.total || 0);
      summary.ncOpen += Number(section.ncOpen || 0);
      summary.ncTotal += Number(section.ncTotal || 0);
      summary.neTotal += Number(section.neTotal || 0);
      return summary;
    }, { remaining: 0, total: 0, ncOpen: 0, ncTotal: 0, neTotal: 0 });
  }

  function zoneProgress(visit, zone) {
    const standard = standardZoneProgress(visit, zone);

    if (!zoneEnabled(visit, zone)) {
      return standard;
    }

    const extraSection = supplementarySection(zone, visit);
    const extra = sectionProgress(extraSection);

    return {
      remaining: standard.remaining + Number(extra.remaining || 0),
      total: standard.total + Number(extra.total || 0),
      ncOpen: standard.ncOpen + Number(extraSection?.ncOpen || 0),
      ncTotal: standard.ncTotal + Number(extraSection?.ncTotal || 0),
      neTotal: standard.neTotal + Number(extraSection?.neTotal || 0)
    };
  }

  function showScreen(name) {
    Object.values(screens).forEach(el => el && el.classList.remove('active'));
    if (screens[name]) screens[name].classList.add('active');
    state.activeScreen = name;
    $('#backButton').classList.toggle('hidden', name === 'search');
    const quickNav = $('#quickNav');
    if (quickNav) quickNav.classList.toggle('hidden', name === 'search' || name === 'visitInit' || !state.activeVisit);
    window.scrollTo(0, 0);
  }

  function categoryIcon(category, model = '') {
    if (/\bmk\b/i.test(model)) return '🏗️';
    if (category === 'CB') return '🚚';
    if (category === 'CN') return '🚐';
    return '🏗️';
  }

  function machineRow(machine) {
    const button = document.createElement('button');
    button.className = 'machine-row';
    button.type = 'button';
    const title = machine.parkNumber || machine.id || 'Machine';
    const description = [machine.brand, machine.model || machine.designation].filter(Boolean).join(' · ');
    button.innerHTML = `
      <span class="machine-icon" aria-hidden="true">${categoryIcon(machine.category, machine.model)}</span>
      <span class="machine-main"><strong>${escapeHtml(title)}</strong><span>${escapeHtml(description)}${machine.agency ? `<br>${escapeHtml(machine.agency)}` : ''}</span></span>
      <span class="machine-arrow" aria-hidden="true">›</span>`;
    button.addEventListener('click', () => openMachine(machine));
    return button;
  }

  function renderMachineList(container, machines, emptyText) {
    container.replaceChildren();
    if (!machines.length) {
      const empty = document.createElement('div');
      empty.className = 'empty-state';
      empty.textContent = emptyText;
      container.appendChild(empty);
      return;
    }
    machines.forEach(machine => container.appendChild(machineRow(machine)));
  }



  const SECTION_ICONS = {
    documentation: '📋', structure: '🏗️', powertrain: '⚙️', stabilisers: '🦵',
    tyres: '🛞', lighting: '💡', cab: '🚪', electrical: '⚡', hydraulic: '💧',
    access: '🧰', upperCab: '👨‍✈️', cec: '💻', boom: '🏗️', mainWinch: '🪝',
    auxWinch: '🪝', upperElectrical: '⚡', workLights: '💡', counterweight: '⚖️',
    slewRing: '🔄', upperHydraulic: '💧', lmi: '📡'
  };




  function isOptionalEquipmentSection(section) {
    if (!section) return false;

    return section.optionalEquipment === true ||
      (
        Array.isArray(section.points) &&
        section.points.length > 0 &&
        section.points.every(point => point.optional === true)
      );
  }

  function optionalPointIsPresent(point, section = currentSection()) {
    if (!point?.optional) return true;

    if (isOptionalEquipmentSection(section)) {
      return section.optionPresent === true;
    }

    return point.optionPresent === true;
  }

  function optionalEquipmentStatusLabel(section) {
    if (!isOptionalEquipmentSection(section)) return '';

    return section.optionPresent === true
      ? 'OPTION PRÉSENTE'
      : 'OPTION ABSENTE · N/A';
  }

  async function setOptionalEquipmentPresence(section, present) {
    if (!section || !isOptionalEquipmentSection(section)) return;
    if (!markVisitDraft()) return;

    const currentlyPresent = section.optionPresent === true;
    if (currentlyPresent === present) return;

    if (!present) {
      const started = section.points.some(point =>
        ['conform', 'finding', 'ne'].includes(point.status)
      );

      if (started) {
        const confirmed = confirm(
          `L’option « ${section.label} » contient déjà des contrôles ou des constats.\n\n` +
          `La déclarer absente passera toute la rubrique en N/A et supprimera les constats associés.\n\n` +
          `Continuer ?`
        );

        if (!confirmed) return;
      }

      const pointIds = new Set(section.points.map(point => point.id));

      const findingsToRemove = (state.activeVisit.findings || [])
        .filter(finding =>
          finding.sectionId === section.id &&
          pointIds.has(finding.pointId)
        );

      for (const finding of findingsToRemove) {
        await deleteFindingPhotos(finding);
      }

      state.activeVisit.findings = (state.activeVisit.findings || [])
        .filter(finding =>
          !(finding.sectionId === section.id && pointIds.has(finding.pointId))
        );

      section.optionPresent = false;
      section.wholeNa = true;
      section.wholeNe = false;
      section.neReason = '';
      section.neComment = '';

      section.points.forEach(point => {
        point.optionPresent = false;
        point.status = 'na';
        point.findingId = null;
        point.neReason = '';
        point.neComment = '';
      });

      recalculateSection(section);
      saveActiveVisit();

      returnAfterSectionCompletion({
        zone: state.activeZone,
        section,
        message: `Option absente : ${section.label} classée N/A.`
      });
      return;
    }

    // Activation de l'équipement : tous ses contrôles deviennent applicables.
    section.optionPresent = true;
    section.wholeNa = false;
    section.wholeNe = false;
    section.neReason = '';
    section.neComment = '';

    section.points.forEach(point => {
      point.optionPresent = true;
      point.status = 'pending';
      point.findingId = null;
      point.neReason = '';
      point.neComment = '';
    });

    recalculateSection(section);
    saveActiveVisit();
    renderInspection();
    showScreen('inspection');

    toast(`Option présente : ${section.label} à contrôler.`);
  }

  async function toggleOptionalEquipmentPresence() {
    const section = currentSection();
    if (!isOptionalEquipmentSection(section)) return;

    await setOptionalEquipmentPresence(
      section,
      section.optionPresent !== true
    );
  }

  function sectionProgress(section) {
    recalculateSection(section);
    const total = Number(section.total || 0);
    const remaining = Number(section.remaining ?? total);
    return { remaining, total, controlled: Math.max(0, total - remaining) };
  }

  function sectionNcTotal(section) {
    return Number(section.ncTotal || 0);
  }

  function renderSectionList() {
    const zone = state.activeZone;
    const list = $('#sectionList');
    if (!zone || !state.activeVisit) return;
    const query = normalize($('#sectionSearch')?.value || '');
    const sections = state.activeVisit.zones?.[zone]?.sections || [];

    const filtered = sections
      .map((section, originalIndex) => {
        const progress = sectionProgress(section);
        return {
          section,
          originalIndex,
          complete: progress.remaining === 0,
          progress
        };
      })
      .filter(item =>
        !query || normalize(item.section.label).includes(query)
      )
      .sort((a, b) => {
        // Les rubriques qui restent à faire restent toujours en haut.
        if (a.complete !== b.complete) {
          return a.complete ? 1 : -1;
        }

        // On conserve l'ordre métier du référentiel dans chaque groupe.
        return a.originalIndex - b.originalIndex;
      });

    list.replaceChildren();

    if (!filtered.length) {
      list.replaceChildren();
      renderSupplementaryZoneCard(zone);

      if (!list.children.length) {
        const empty = document.createElement('div');
        empty.className = 'empty-state';
        empty.textContent = 'Aucune rubrique trouvée.';
        list.appendChild(empty);
      }

      return;
    }

    filtered.forEach(item => {
      const section = item.section;
      const progress = item.progress;
      const nc = sectionNcTotal(section);
      const button = document.createElement('button');
      button.type = 'button';
      button.className = `control-section-row${progress.remaining === 0 ? ' is-complete' : ''}`;
      button.innerHTML = `
        <span class="section-icon" aria-hidden="true">${SECTION_ICONS[section.id] || '✓'}</span>
        <span class="section-copy">
          <strong>${escapeHtml(section.label)}</strong>
          <small>${
            isOptionalEquipmentSection(section)
              ? (
                  section.optionPresent === true
                    ? `${optionalEquipmentStatusLabel(section)} · ${progress.controlled} point(s) traité(s)`
                    : optionalEquipmentStatusLabel(section)
                )
              : (
                  progress.remaining === 0
                    ? `✓ Terminé · ${progress.total === 0 && Number(section.naTotal || 0) > 0
                        ? `${section.naTotal} point(s) N/A`
                        : `${progress.controlled} point(s) traité(s)`}`
                    : `${progress.controlled} point(s) traité(s)`
                )
          }</small>
        </span>
        <span class="section-metrics">
          <strong>${progress.remaining}/${progress.total}</strong>
          ${nc > 0 ? `<span class="section-nc">NC ${nc}</span>` : ''}
        </span>
        <span class="section-arrow" aria-hidden="true">›</span>`;
      button.addEventListener('click', event => {
        if (event.target.closest('.section-nc')) {
          openFindings(zone, section.id);
          return;
        }
        if (zone === 'carrier' && section.id === 'tyres') openTyreInspection();
        else openInspection(zone, section.id);
      });
      list.appendChild(button);
    });

    // Toujours séparé du référentiel standard et placé en dernier.
    renderSupplementaryZoneCard(zone);
  }


  function renderTyreStatusButtons(selected) {
    return ['100','75','50','25','HS','pending'].map(value => {
      const label = value === 'pending' ? 'Non contrôlé' : value === 'HS' ? 'HS' : `${value} %`;
      return `<button type="button" class="tyre-state-option tyre-state-${value.toLowerCase()}${selected === value ? ' is-selected' : ''}" data-tyre-value="${value}">${label}</button>`;
    }).join('');
  }


  function renderTyreContextButtons(selected) {
    return ['100','75','50','25','HS','pending'].map(value => {
      const label = value === 'pending' ? '—' : value === 'HS' ? 'HS' : value;
      const title = value === 'pending' ? 'Non contrôlé' : value === 'HS' ? 'Hors service' : `${value} %`;
      return `<button type="button" class="tyre-context-option tyre-state-${value.toLowerCase()}${selected === value ? ' is-selected' : ''}" data-tyre-context-value="${value}" title="${title}" aria-label="${title}">${label}</button>`;
    }).join('');
  }

  function openTyreInspection() {
    state.activeZone = 'carrier';
    state.activeSectionId = 'tyres';
    ensureTyreData(state.activeVisit, state.activeMachine);
    renderTyreInspection();
    showScreen('tyres');
  }

  function renderTyreInspection() {
    ensureTyreSectionStatusUi();

    const data = ensureTyreData(state.activeVisit, state.activeMachine);
    const section = currentSection();
    const progress = sectionProgress(section);
    const wholeNa = section?.wholeNa === true;
    const wholeNe = section?.wholeNe === true;
    const wholeDisabled = wholeNa || wholeNe;

    $('#tyreMachineSubtitle').textContent = `${state.activeMachine.parkNumber || state.activeMachine.id} · ${state.activeMachine.model || state.activeMachine.designation || ''}`;
    $('#tyreProgress').textContent = wholeNa
      ? 'N/A'
      : wholeNe
        ? 'NE'
        : `${progress.remaining}/${progress.total}`;

    const naButton = $('#setTyreSectionNa');
    const neButton = $('#setTyreSectionNe');

    if (naButton) {
      naButton.classList.toggle('is-active', wholeNa);
      naButton.innerHTML = wholeNa
        ? `<strong>Réactiver la rubrique</strong>
           <span>Annuler le N/A des pneumatiques</span>`
        : `<strong>N/A — Toute la rubrique</strong>
           <span>Déclarer les pneumatiques non applicables</span>`;
    }

    if (neButton) {
      neButton.classList.toggle('is-active', wholeNe);
      neButton.innerHTML = wholeNe
        ? `<strong>Réactiver la rubrique</strong>
           <span>${escapeHtml(section.neReason || 'Annuler le NE des pneumatiques')}</span>`
        : `<strong>NE — Toute la rubrique</strong>
           <span>Déclarer les pneumatiques non évalués</span>`;
    }

    $('#axleCountSelector').innerHTML = Array.from({length:8},(_,i)=>i+2).map(count => `<button type="button" class="axle-count-button${count===data.axleCount?' is-active':''}" data-axle-count="${count}"${wholeDisabled ? ' disabled' : ''}>${count}</button>`).join('');

    const resetButton = $('#resetTyres');
    if (resetButton) resetButton.disabled = wholeDisabled;

    const diagram = $('#tyreDiagram');
    const nextPendingId = data.axles.flatMap(axle => axle.tyres).find(tyre => tyre.value === 'pending')?.id || null;
    diagram.innerHTML = data.axles.map((axle, axleIndex) => {
      const tyreButton = tyre => {
        const label = tyre.value === 'pending' ? '—' : tyre.value === 'HS' ? 'HS' : `${tyre.value}%`;
        const nextClass = tyre.id === nextPendingId ? ' is-next-pending' : '';
        return `<button type="button" class="tyre-wheel tyre-${String(tyre.value).toLowerCase()}${nextClass}" data-tyre-id="${tyre.id}" aria-label="${escapeHtml(tyrePositionLabel(axleIndex, tyre.side, tyre.position))} : ${label}"${wholeDisabled ? ' disabled' : ''}><span>${label}</span></button>`;
      };
      const left = axle.tyres.filter(t=>t.side==='left').map(tyreButton).join('');
      const right = axle.tyres.filter(t=>t.side==='right').slice().reverse().map(tyreButton).join('');
      return `<section class="tyre-axle-row">
        <div class="tyre-side tyre-side-left">${left}</div>
        <button type="button" class="tyre-axle-label" data-toggle-axle="${axleIndex}"${wholeDisabled ? ' disabled' : ''}><strong>ESSIEU ${axleIndex+1}</strong><span>${axle.mode === 'dual' ? 'Roues jumelées' : 'Roues simples'}</span></button>
        <div class="tyre-side tyre-side-right">${right}</div>
      </section>`;
    }).join('');
  }

  function setAxleCount(count) {
    const section = currentSection();
    if (section?.wholeNa === true || section?.wholeNe === true) {
      toast('Réactivez d’abord la rubrique Pneumatiques.');
      return;
    }

    if (!markVisitDraft()) return;
    const current = ensureTyreData(state.activeVisit, state.activeMachine);
    const old = current.axles;
    current.axleCount = count;
    current.axles = Array.from({length: count}, (_, index) => old[index] || createTyreData(state.activeMachine, count).axles[index]);
    ensureTyreData(state.activeVisit, state.activeMachine);
    renderTyreInspection();
  }

  function toggleAxleMode(index) {
    const section = currentSection();
    if (section?.wholeNa === true || section?.wholeNe === true) {
      toast('Réactivez d’abord la rubrique Pneumatiques.');
      return;
    }

    if (!markVisitDraft()) return;
    const data = ensureTyreData(state.activeVisit, state.activeMachine);
    const axle = data.axles[index];
    if (!axle) return;
    const previousBySide = {};
    for (const tyre of axle.tyres) previousBySide[tyre.side] = previousBySide[tyre.side] || tyre;
    axle.mode = axle.mode === 'dual' ? 'single' : 'dual';
    axle.tyres = ['left','right'].flatMap(side => tyrePositions(axle.mode).map(position => {
      const id = tyrePointId(index, side, position);
      const same = (axle.tyres || []).find(t=>t.id===id);
      const fallback = previousBySide[side];
      return { id, side, position, value: same?.value || fallback?.value || 'pending', findingId: same?.findingId || fallback?.findingId || null };
    }));
    syncTyreSection();
    renderTyreInspection();
  }

  function positionTyreContextMenu(anchor) {
    const menu = $('#tyreContextMenu');
    if (!menu || !anchor) return;
    const rect = anchor.getBoundingClientRect();
    menu.classList.remove('is-above');
    menu.style.visibility = 'hidden';
    menu.classList.remove('hidden');
    const menuRect = menu.getBoundingClientRect();
    const margin = 10;
    let left = rect.left + rect.width / 2 - menuRect.width / 2;
    left = Math.max(margin, Math.min(left, window.innerWidth - menuRect.width - margin));
    let top = rect.bottom + 10;
    if (top + menuRect.height > window.innerHeight - margin) {
      top = rect.top - menuRect.height - 10;
      menu.classList.add('is-above');
    }
    const arrowLeft = Math.max(12, Math.min(rect.left + rect.width / 2 - left - 6, menuRect.width - 24));
    menu.style.left = `${Math.round(left)}px`;
    menu.style.top = `${Math.round(top)}px`;
    menu.style.setProperty('--arrow-left', `${Math.round(arrowLeft)}px`);
    menu.style.visibility = 'visible';
  }

  function openTyreContextMenu(pointId, anchor) {
    const section = currentSection();
    if (section?.wholeNa === true || section?.wholeNe === true) {
      toast('Réactivez d’abord la rubrique Pneumatiques.');
      return;
    }

    const tyre = findTyre(pointId);
    if (!tyre) return;
    closeTyreContextMenu();
    state.activeTyrePointId = pointId;
    state.activeTyreAnchor = anchor || null;
    $('#tyreContextOptions').innerHTML = renderTyreContextButtons(tyre.value);
    $('#tyreContextFinding').classList.toggle('hidden', tyre.value !== 'HS');
    if (anchor) anchor.classList.add('is-context-active');
    positionTyreContextMenu(anchor);
  }

  function closeTyreContextMenu() {
    $('#tyreContextMenu')?.classList.add('hidden');
    document.querySelectorAll('.tyre-wheel.is-context-active').forEach(el => el.classList.remove('is-context-active'));
    state.activeTyreAnchor = null;
  }

  function openTyreStateDialog(pointId) {
    const anchor = document.querySelector(`[data-tyre-id="${CSS.escape(pointId)}"]`);
    openTyreContextMenu(pointId, anchor);
  }

  function closeTyreStateDialog() {
    closeTyreContextMenu();
  }

  function setTyreValue(value) {
    const section = currentSection();
    if (section?.wholeNa === true || section?.wholeNe === true) {
      toast('Réactivez d’abord la rubrique Pneumatiques.');
      return;
    }

    if (!markVisitDraft()) return;
    const tyre = findTyre(state.activeTyrePointId);
    if (!tyre || !TYRE_STATES.includes(value)) return;
    tyre.value = value;
    if (value !== 'HS' && tyre.findingId) {
      const point = currentSection()?.points?.find(p=>p.id===tyre.id);
      if (point) point.findingId = tyre.findingId;
    }
    syncTyreSection();
    saveActiveVisit();
    closeTyreContextMenu();

    const completedSection = currentSection();
    if (completedSection && sectionProgress(completedSection).remaining === 0) {
      returnAfterSectionCompletion({
        zone: state.activeZone,
        section: completedSection,
        message: 'Rubrique Pneumatiques terminée.'
      });
      return;
    }

    renderTyreInspection();
    toast(value === 'pending' ? 'Pneu remis à non contrôlé.' : `État du pneu : ${value === 'HS' ? 'HS' : value + ' %'}.`);
  }

  function resetTyres() {
    const section = currentSection();
    if (section?.wholeNa === true || section?.wholeNe === true) {
      toast('Réactivez d’abord la rubrique Pneumatiques.');
      return;
    }

    if (!confirm('Remettre tous les pneumatiques à Non contrôlé ?')) return;
    if (!markVisitDraft()) return;
    const data = ensureTyreData(state.activeVisit, state.activeMachine);
    data.axles.forEach(axle => axle.tyres.forEach(tyre => { tyre.value = 'pending'; }));
    syncTyreSection();
    saveActiveVisit();
    renderTyreInspection();
    toast('Tous les pneumatiques ont été remis à non contrôlé.');
  }

  function createTyreFinding() {
    const section = currentSection();
    if (section?.wholeNa === true || section?.wholeNe === true) {
      toast('Réactivez d’abord la rubrique Pneumatiques.');
      return;
    }

    const tyre = findTyre(state.activeTyrePointId);
    if (!tyre) return;
    syncTyreSection();
    state.activePointId = tyre.id;
    closeTyreContextMenu();
    openFindingForm();
  }

  function pointStatusIcon(status) {
    if (status === 'conform') return '✓';
    if (status === 'finding') return '⚠';
    if (status === 'na') return 'N/A';
    if (status === 'ne') return 'NE';
    return '○';
  }

  async function removePointFinding(point) {
    if (!point?.findingId || !state.activeVisit) return;
    const finding = state.activeVisit.findings.find(item => item.id === point.findingId);
    await deleteFindingPhotos(finding);
    state.activeVisit.findings = state.activeVisit.findings.filter(item => item.id !== point.findingId);
    point.findingId = null;
  }


  function ensureTyreSectionStatusUi() {
    const tyreScreen = $('#tyreScreen');
    if (!tyreScreen) return;

    if (!$('#tyreSectionStatusActions')) {
      const actions = document.createElement('div');
      actions.id = 'tyreSectionStatusActions';
      actions.className = 'section-status-actions';
      actions.innerHTML = `
        <button id="setTyreSectionNa" class="section-status-button" type="button">
          <strong>N/A — Toute la rubrique</strong>
          <span>Déclarer les pneumatiques non applicables</span>
        </button>

        <button id="setTyreSectionNe" class="section-status-button" type="button">
          <strong>NE — Toute la rubrique</strong>
          <span>Déclarer les pneumatiques non évalués</span>
        </button>
      `;

      const toolbar = $('#tyreScreen .tyre-toolbar');
      if (toolbar) toolbar.insertAdjacentElement('beforebegin', actions);
      else $('#tyreScreen .tyre-heading')?.insertAdjacentElement('afterend', actions);

      $('#setTyreSectionNa').addEventListener('click', toggleWholeSectionNa);
      $('#setTyreSectionNe').addEventListener('click', openWholeSectionNeDialog);
    }
  }

  function renderActiveSectionAfterStatusChange() {
    if (state.activeSectionId === 'tyres') {
      renderTyreInspection();
      showScreen('tyres');
    } else {
      renderInspection();
      showScreen('inspection');
    }
  }

  function ensurePointStatusUi() {
    if (!document.getElementById('vfg-point-status-style')) {
      const style = document.createElement('style');
      style.id = 'vfg-point-status-style';
      style.textContent = `
        .inspection-point {
          grid-template-columns: auto minmax(0, 1fr) auto !important;
        }
        .point-inline-actions {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 6px;
          flex-wrap: wrap;
        }
        .point-mini-status {
          min-width: 42px;
          height: 38px;
          padding: 0 8px;
          border: 1px solid #d7d7d7;
          border-radius: 999px;
          background: #f5f5f3;
          color: #555;
          font: inherit;
          font-size: 12px;
          font-weight: 800;
          cursor: pointer;
        }
        .point-mini-status.is-active {
          border-color: #ff6a00;
          background: #fff1e7;
          color: #d95700;
        }
        .point-ne-reason {
          display: block;
          margin-top: 4px;
          color: #777;
          font-size: 11px;
          font-weight: 700;
        }
        .inspection-point.is-ne .point-label-button::after {
          content: " · NE";
          font-size: 11px;
          font-weight: 800;
          color: #777;
        }
        .inspection-point.is-na {
          opacity: .72;
        }
        #pointNeDialog .point-dialog {
          width: min(92vw, 520px);
        }
        #pointNeDialog label {
          display: block;
          margin: 14px 0 6px;
          font-weight: 700;
        }
        #pointNeDialog select,
        #pointNeDialog textarea {
          width: 100%;
          box-sizing: border-box;
          border: 1px solid #d5d5d5;
          border-radius: 10px;
          padding: 11px 12px;
          font: inherit;
          background: white;
        }
        #pointNeDialog textarea {
          min-height: 90px;
          resize: vertical;
        }
        #pointNeActions {
          display: flex;
          gap: 10px;
          justify-content: flex-end;
          margin-top: 16px;
        }
        #pointNeActions button {
          border-radius: 10px;
          padding: 10px 16px;
          font-weight: 800;
          cursor: pointer;
        }
        #pointNeCancel {
          background: white;
          border: 1px solid #d5d5d5;
        }
        #pointNeSave {
          background: #ff6a00;
          color: white;
          border: 1px solid #ff6a00;
        }

        .section-status-actions {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin: 10px 0 16px;
        }
        .section-status-button {
          width: 100%;
          padding: 14px 16px;
          border: 1px solid #b9b9b9;
          border-radius: 16px;
          background: #fff;
          color: #444;
          text-align: left;
          cursor: pointer;
        }
        .section-status-button strong,
        .section-status-button span {
          display: block;
        }
        .section-status-button strong {
          font-size: 15px;
        }
        .section-status-button span {
          margin-top: 4px;
          color: #777;
          font-size: 12px;
        }
        .section-status-button.is-active {
          border-color: #ff6a00;
          background: #fff1e7;
          color: #d95700;
        }
        .inspection-point.is-ne .point-status-button,
        .inspection-point.is-na .point-status-button {
          min-width: 46px;
          width: auto;
          padding: 0 7px;
          border-radius: 999px;
        }
        @media (max-width: 640px) {
          .section-status-actions {
            grid-template-columns: 1fr;
          }
        }

        .finding-status-actions {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          margin: 0 0 18px;
          padding: 12px;
          border: 1px solid #e1e1e1;
          border-radius: 14px;
          background: #fafafa;
        }
        .finding-status-actions::before {
          content: "État du point";
          grid-column: 1 / -1;
          font-size: 12px;
          font-weight: 800;
          color: #666;
          text-transform: uppercase;
          letter-spacing: .04em;
        }
        .finding-status-action {
          min-height: 46px;
          border: 1px solid #d5d5d5;
          border-radius: 12px;
          background: #fff;
          color: #444;
          font: inherit;
          font-weight: 800;
          cursor: pointer;
        }
        .finding-status-action.is-active {
          border-color: #ff6a00;
          background: #fff1e7;
          color: #d95700;
        }

        .finding-current-status {
          grid-column: 1 / -1;
          display: flex;
          align-items: center;
          gap: 10px;
          margin: 0 0 12px;
          padding: 10px 12px;
          border: 1px solid #e2e2e2;
          border-radius: 12px;
          background: #fff;
          color: #666;
          font-size: 13px;
        }
        .finding-current-status strong {
          color: #222;
        }
        .finding-current-status button {
          margin-left: auto;
          border: 1px solid #ccc;
          border-radius: 999px;
          background: #fff;
          padding: 6px 10px;
          font: inherit;
          font-size: 12px;
          font-weight: 800;
          cursor: pointer;
        }

        @media (max-width: 720px) {
          .inspection-point {
            grid-template-columns: auto minmax(0, 1fr) !important;
          }
          .point-inline-actions {
            grid-column: 2;
            justify-content: flex-start;
          }
        }
      `;
      document.head.appendChild(style);
    }

    if (!document.getElementById('pointNeDialog')) {
      const dialog = document.createElement('div');
      dialog.id = 'pointNeDialog';
      dialog.className = 'dialog-backdrop hidden';
      dialog.setAttribute('role', 'dialog');
      dialog.setAttribute('aria-modal', 'true');
      dialog.setAttribute('aria-hidden', 'true');

      dialog.innerHTML = `
        <div class="point-dialog">
          <button id="pointNeClose" class="dialog-close" type="button" aria-label="Fermer">×</button>
          <h2 id="pointNeDialogTitle">Non évalué (NE)</h2>
          <p id="pointNePointLabel"></p>

          <label for="pointNeReason">Justification obligatoire</label>
          <select id="pointNeReason">
            <option value="">— Choisir —</option>
            <option value="Pas d’opérateur">Pas d’opérateur</option>
            <option value="Réglementation circulation">Réglementation circulation</option>
            <option value="Machine non opérationnelle">Machine non opérationnelle</option>
            <option value="Autres">Autres</option>
          </select>

          <label for="pointNeComment">Commentaire complémentaire</label>
          <textarea id="pointNeComment" placeholder="Obligatoire si « Autres »"></textarea>

          <div id="pointNeActions">
            <button id="pointNeCancel" type="button">Annuler</button>
            <button id="pointNeSave" type="button">Enregistrer NE</button>
          </div>
        </div>`;

      document.body.appendChild(dialog);

        dialog.dataset.mode = 'point';

      $('#pointNeClose').addEventListener('click', closeNeDialog);
      $('#pointNeCancel').addEventListener('click', closeNeDialog);
      $('#pointNeSave').addEventListener('click', saveNeDialog);
      dialog.addEventListener('click', event => {
        if (event.target === dialog) closeNeDialog();
      });
    }

    // N/A / NE ne sont plus proposés dans le sous-menu générique.
    $('#pointActionNa')?.remove();
    $('#pointActionNe')?.remove();

    // N/A / NE pour toute la rubrique.
    const validateSectionButton = $('#validateSection');
    if (validateSectionButton && !$('#sectionStatusActions')) {
      const sectionActions = document.createElement('div');
      sectionActions.id = 'sectionStatusActions';
      sectionActions.className = 'section-status-actions';
      sectionActions.innerHTML = `
        <button id="setSectionNa" class="section-status-button" type="button">
          <strong>N/A — Toute la rubrique</strong>
          <span>Déclarer cette rubrique non applicable</span>
        </button>

        <button id="setSectionNe" class="section-status-button" type="button">
          <strong>NE — Toute la rubrique</strong>
          <span>Déclarer cette rubrique non évaluée</span>
        </button>
      `;

      validateSectionButton.insertAdjacentElement('afterend', sectionActions);

      $('#setSectionNa').addEventListener('click', toggleWholeSectionNa);
      $('#setSectionNe').addEventListener('click', openWholeSectionNeDialog);
    }

    // N/A et NE directement dans l'écran CONSTAT du point.
    const findingCard = $('#findingFormScreen .finding-form-card');
    if (findingCard && !$('#findingStatusActions')) {
      const actions = document.createElement('div');
      actions.id = 'findingStatusActions';
      actions.className = 'finding-status-actions';
      actions.innerHTML = `
        <div id="findingCurrentStatus" class="finding-current-status">
          <span>Statut actuel : <strong id="findingCurrentStatusText">À contrôler</strong></span>
          <button id="findingResetPoint" type="button">Remettre à contrôler</button>
        </div>

        <button id="findingSetNa" class="finding-status-action" type="button">
          N/A — Non applicable
        </button>
        <button id="findingSetNe" class="finding-status-action" type="button">
          NE — Non évalué
        </button>
      `;

      const firstLabel = findingCard.querySelector('label');
      findingCard.insertBefore(actions, firstLabel || findingCard.firstChild);

      $('#findingSetNa').addEventListener('click', () => {
        setPointNa(state.activePointId);
      });

      $('#findingSetNe').addEventListener('click', () => {
        openNeDialog(state.activePointId);
      });

      $('#findingResetPoint').addEventListener('click', () => {
        resetPointToPending(state.activePointId);
      });
    }
  }




  function clearWholeSectionStatus(section) {
    if (!section) return;
    section.wholeNa = false;
    section.wholeNe = false;
    section.neReason = '';
    section.neComment = '';
  }

  function pointStatusLabel(point) {
    if (!point) return 'À contrôler';
    if (point.status === 'conform') return 'Conforme';
    if (point.status === 'finding') return 'Constat';
    if (point.status === 'na') return 'N/A — Non applicable';
    if (point.status === 'ne') return 'NE — Non évalué';
    return 'À contrôler';
  }

  async function confirmReplaceFinding(point, targetLabel) {
    if (!point?.findingId) return true;

    const confirmed = confirm(
      `Un constat est déjà enregistré pour ce point.\n\n` +
      `Le passer en « ${targetLabel} » supprimera ce constat et ses photos.\n\n` +
      `Continuer ?`
    );

    if (!confirmed) return false;

    await removePointFinding(point);
    return true;
  }

  async function resetPointToPending(pointId = state.activePointId) {
    if (!markVisitDraft()) return;

    const section = currentSection();
    const point = section?.points?.find(item => item.id === pointId);
    if (!point) return;

    if (point.findingId) {
      const confirmed = confirm(
        'Remettre ce point à contrôler supprimera le constat enregistré et ses photos.\n\nContinuer ?'
      );
      if (!confirmed) return;
      await removePointFinding(point);
    }

    clearWholeSectionStatus(section);

    const tyre = findTyre(point.id);
    if (tyre) {
      tyre.value = 'pending';
      tyre.findingId = null;
      syncTyreSection();
    } else {
      point.status = 'pending';
      point.findingId = null;
      point.neReason = '';
      point.neComment = '';
      recalculateSection(section);
    }

    saveActiveVisit();

    state.draftPhotos = [];
    state.draftFindingId = null;
    state.originalPhotoIds = [];
    state.removedPhotoIds = [];
    clearPhotoObjectUrls();

    if (state.activeSectionId === 'tyres') {
      renderTyreInspection();
      showScreen('tyres');
    } else {
      renderInspection();
      showScreen('inspection');
    }

    toast('Point remis à contrôler.');
  }

  function restoreSectionDefaultStatuses(section) {
    if (!section) return;

    section.wholeNa = false;
    section.wholeNe = false;
    section.neReason = '';
    section.neComment = '';

    section.points.forEach(point => {
      if (point.optional) {
        const present = isOptionalEquipmentSection(section)
          ? section.optionPresent === true
          : point.optionPresent === true;

        point.status = present ? 'pending' : 'na';
      } else {
        point.status = 'pending';
      }

      point.findingId = null;
      point.neReason = '';
      point.neComment = '';
    });

    if (section.id === 'tyres') {
      syncTyreSection();
    }

    recalculateSection(section);
  }

  async function toggleWholeSectionNa() {
    const section = currentSection();
    if (!section) return;

    if (isOptionalEquipmentSection(section)) {
      await setOptionalEquipmentPresence(
        section,
        section.optionPresent !== true
      );
      return;
    }

    if (!markVisitDraft()) return;

    // Réactivation de la rubrique : retour aux statuts initiaux du référentiel.
    if (section.wholeNa === true) {
      restoreSectionDefaultStatuses(section);
      saveActiveVisit();
      renderActiveSectionAfterStatusChange();
      toast('Rubrique réactivée.');
      return;
    }

    // Si la rubrique était NE, N/A remplace NE.
    if (section.wholeNe === true) {
      section.wholeNe = false;
      section.neReason = '';
      section.neComment = '';
    }

    const started = section.points.some(point =>
      ['conform', 'finding', 'ne'].includes(point.status)
    );

    if (started) {
      const confirmed = confirm(
        'Cette rubrique contient déjà des points contrôlés ou des constats.\n\n' +
        'Passer toute la rubrique en N/A supprimera ces états et les constats associés.\n\n' +
        'Continuer ?'
      );
      if (!confirmed) return;
    }

    const pointIds = new Set(section.points.map(point => point.id));

    const findingsToRemove = (state.activeVisit.findings || [])
      .filter(finding =>
        finding.sectionId === section.id &&
        pointIds.has(finding.pointId)
      );

    for (const finding of findingsToRemove) {
      await deleteFindingPhotos(finding);
    }

    state.activeVisit.findings = (state.activeVisit.findings || [])
      .filter(finding =>
        !(finding.sectionId === section.id && pointIds.has(finding.pointId))
      );

    section.points.forEach(point => {
      point.status = 'na';
      point.findingId = null;
      point.neReason = '';
      point.neComment = '';
    });

    section.wholeNa = true;
    section.wholeNe = false;
    section.neReason = '';
    section.neComment = '';

    // Empêche la rubrique pneumatiques d'être recalculée immédiatement en "pending".
    if (section.id === 'tyres') {
      (state.activeVisit.tyres?.axles || []).forEach(axle => {
        (axle.tyres || []).forEach(tyre => {
          tyre.findingId = null;
        });
      });
    }

    recalculateSection(section);
    saveActiveVisit();

    returnAfterSectionCompletion({
      zone: state.activeZone,
      section,
      message: 'Rubrique classée N/A.'
    });
  }

  function openNeDialog(pointId) {
    ensurePointStatusUi();

    const section = currentSection();
    const point = section?.points?.find(item => item.id === pointId);
    if (!point) return;

    state.activePointId = pointId;

    const dialog = $('#pointNeDialog');
    dialog.dataset.mode = 'point';

    $('#pointNeDialogTitle').textContent = 'Point non évalué (NE)';
    $('#pointNePointLabel').textContent = point.label;
    $('#pointNeReason').value = point.status === 'ne' ? (point.neReason || '') : '';
    $('#pointNeComment').value = point.status === 'ne' ? (point.neComment || '') : '';

    dialog.classList.remove('hidden');
    dialog.setAttribute('aria-hidden', 'false');
  }

  function openWholeSectionNeDialog() {
    ensurePointStatusUi();

    const section = currentSection();
    if (!section) return;

    // Si déjà NE, un clic réactive la rubrique.
    if (section.wholeNe === true) {
      restoreSectionDefaultStatuses(section);
      saveActiveVisit();
      renderActiveSectionAfterStatusChange();
      toast('Rubrique réactivée.');
      return;
    }

    const dialog = $('#pointNeDialog');
    dialog.dataset.mode = 'section';

    $('#pointNeDialogTitle').textContent = 'Rubrique non évaluée (NE)';
    $('#pointNePointLabel').textContent = section.label;
    $('#pointNeReason').value = section.neReason || '';
    $('#pointNeComment').value = section.neComment || '';

    dialog.classList.remove('hidden');
    dialog.setAttribute('aria-hidden', 'false');
  }

  function closeNeDialog() {
    const dialog = $('#pointNeDialog');
    if (!dialog) return;
    dialog.classList.add('hidden');
    dialog.setAttribute('aria-hidden', 'true');
    dialog.dataset.mode = 'point';
  }

  async function saveNeDialog() {
    const dialog = $('#pointNeDialog');
    const mode = dialog?.dataset.mode || 'point';

    if (mode === 'section') {
      await saveWholeSectionNe();
    } else {
      await savePointNe();
    }
  }

  async function savePointNe() {
    const section = currentSection();
    const point = section?.points?.find(item => item.id === state.activePointId);
    if (!point) {
      closeNeDialog();
      return;
    }

    const reason = $('#pointNeReason').value;
    const comment = $('#pointNeComment').value.trim();

    if (!reason) {
      toast('Choisissez la justification du point non évalué.');
      return;
    }

    if (reason === 'Autres' && !comment) {
      toast('Un commentaire est obligatoire lorsque « Autres » est choisi.');
      return;
    }

    if (!markVisitDraft()) return;

    const canReplace = await confirmReplaceFinding(point, 'NE — Non évalué');
    if (!canReplace) return;

    clearWholeSectionStatus(section);

    if (point.optional && !isOptionalEquipmentSection(section)) {
      point.optionPresent = true;
    }

    point.status = 'ne';
    point.findingId = null;
    point.neReason = reason;
    point.neComment = comment;

    recalculateSection(section);
    saveActiveVisit();
    closeNeDialog();

    state.draftPhotos = [];
    state.draftFindingId = null;
    state.originalPhotoIds = [];
    state.removedPhotoIds = [];
    clearPhotoObjectUrls();

    if (sectionProgress(section).remaining === 0) {
      returnAfterSectionCompletion({
        zone: state.activeZone,
        section,
        message: 'Rubrique terminée.'
      });
      return;
    }

    renderInspection();
    showScreen('inspection');

    toast(`Point enregistré NE : ${reason}.`);
  }

  async function saveWholeSectionNe() {
    const section = currentSection();
    if (!section) {
      closeNeDialog();
      return;
    }

    const reason = $('#pointNeReason').value;
    const comment = $('#pointNeComment').value.trim();

    if (!reason) {
      toast('Choisissez la justification de la rubrique non évaluée.');
      return;
    }

    if (reason === 'Autres' && !comment) {
      toast('Un commentaire est obligatoire lorsque « Autres » est choisi.');
      return;
    }

    const started = section.points.some(point =>
      ['conform', 'finding', 'ne'].includes(point.status)
    );

    if (started && section.wholeNe !== true) {
      const confirmed = confirm(
        'Cette rubrique contient déjà des points contrôlés ou des constats.\n\n' +
        'Passer toute la rubrique en NE remplacera ces états.\n\n' +
        'Continuer ?'
      );
      if (!confirmed) return;
    }

    if (!markVisitDraft()) return;

    const pointIds = new Set(section.points.map(point => point.id));

    const findingsToRemove = (state.activeVisit.findings || [])
      .filter(finding =>
        finding.sectionId === section.id &&
        pointIds.has(finding.pointId)
      );

    for (const finding of findingsToRemove) {
      await deleteFindingPhotos(finding);
    }

    state.activeVisit.findings = (state.activeVisit.findings || [])
      .filter(finding =>
        !(finding.sectionId === section.id && pointIds.has(finding.pointId))
      );

    section.points.forEach(point => {
      point.status = 'ne';
      point.findingId = null;
      point.neReason = reason;
      point.neComment = comment;
    });

    section.wholeNe = true;
    section.wholeNa = false;
    section.neReason = reason;
    section.neComment = comment;

    if (section.id === 'tyres') {
      (state.activeVisit.tyres?.axles || []).forEach(axle => {
        (axle.tyres || []).forEach(tyre => {
          tyre.findingId = null;
        });
      });
    }

    recalculateSection(section);
    saveActiveVisit();
    closeNeDialog();

    returnAfterSectionCompletion({
      zone: state.activeZone,
      section,
      message: `Rubrique classée NE : ${reason}.`
    });
  }


  async function setPointNa(pointId) {
    if (!markVisitDraft()) return;

    const section = currentSection();
    const point = section?.points?.find(item => item.id === pointId);
    if (!point) return;

    clearWholeSectionStatus(section);

    if (point.status === 'na') {
      if (
        point.optional &&
        isOptionalEquipmentSection(section) &&
        section.optionPresent !== true
      ) {
        await setOptionalEquipmentPresence(section, true);
        return;
      }

      if (point.optional && !isOptionalEquipmentSection(section)) {
        point.optionPresent = true;
      }

      point.status = 'pending';
      point.findingId = null;
      point.neReason = '';
      point.neComment = '';

      recalculateSection(section);
      saveActiveVisit();

      state.draftPhotos = [];
      state.draftFindingId = null;
      state.originalPhotoIds = [];
      state.removedPhotoIds = [];
      clearPhotoObjectUrls();

      renderInspection();
      showScreen('inspection');
      toast('N/A annulé : point remis à contrôler.');
      return;
    }

    const canReplace = await confirmReplaceFinding(point, 'N/A — Non applicable');
    if (!canReplace) return;

    if (point.optional && !isOptionalEquipmentSection(section)) {
      point.optionPresent = false;
    }

    point.status = 'na';
    point.findingId = null;
    point.neReason = '';
    point.neComment = '';

    recalculateSection(section);
    saveActiveVisit();

    state.draftPhotos = [];
    state.draftFindingId = null;
    state.originalPhotoIds = [];
    state.removedPhotoIds = [];
    clearPhotoObjectUrls();

    if (sectionProgress(section).remaining === 0) {
      returnAfterSectionCompletion({
        zone: state.activeZone,
        section,
        message: 'Rubrique terminée.'
      });
      return;
    }

    renderInspection();
    showScreen('inspection');

    toast('Point enregistré N/A.');
  }

  function openInspection(zone, sectionId) {
    state.activeZone = zone;
    state.activeSectionId = sectionId;
    state.activePointId = null;
    renderInspection();
    showScreen('inspection');
  }

  function renderInspection() {
    const section = currentSection();
    if (!section) return;

    recalculateSection(section);
    const progress = sectionProgress(section);

    $('#inspectionTitle').textContent = section.label;
    $('#inspectionSubtitle').textContent =
      `${state.activeMachine.parkNumber || state.activeMachine.id} · ${zoneDisplayLabel(state.activeMachine, state.activeZone, state.activeVisit)}`;
    $('#inspectionProgress').textContent = isSupplementarySection(section)
      ? (
          section.points.length === 0
            ? 'Hors référentiel'
            : `${progress.remaining}/${progress.total} · ajouté au total visite`
        )
      : `${progress.remaining}/${progress.total}`;

    renderOptionalEquipmentPanel(section);
    renderSupplementaryEditor(section);

    const treated = progress.total - progress.remaining;
    $('#validateSection').classList.toggle(
      'hidden',
      isSupplementarySection(section) ||
      treated > 0 ||
      section.wholeNa === true ||
      section.wholeNe === true ||
      (
        isOptionalEquipmentSection(section) &&
        section.optionPresent !== true
      )
    );

    const sectionNaButton = $('#setSectionNa');
    const sectionNeButton = $('#setSectionNe');

    if (isSupplementarySection(section)) {
      sectionNaButton?.classList.add('hidden');
      sectionNeButton?.classList.add('hidden');
    } else {
      sectionNaButton?.classList.remove('hidden');
      sectionNeButton?.classList.remove('hidden');
    }

    if (sectionNaButton) {
      const wholeNa = section.wholeNa === true;
      const optionalSection = isOptionalEquipmentSection(section);

      sectionNaButton.classList.toggle('is-active', wholeNa);

      if (optionalSection) {
        sectionNaButton.innerHTML = section.optionPresent === true
          ? `<strong>Option présente</strong>
             <span>Déclarer l’équipement absent et classer la rubrique N/A</span>`
          : `<strong>Option absente — N/A</strong>
             <span>Activer l’équipement pour réaliser les contrôles</span>`;
      } else {
        sectionNaButton.innerHTML = wholeNa
          ? `<strong>Réactiver la rubrique</strong>
             <span>Annuler le N/A de toute la rubrique</span>`
          : `<strong>N/A — Toute la rubrique</strong>
             <span>Déclarer cette rubrique non applicable</span>`;
      }
    }

    if (sectionNeButton) {
      const wholeNe = section.wholeNe === true;
      const optionAbsent =
        isOptionalEquipmentSection(section) &&
        section.optionPresent !== true;

      sectionNeButton.classList.toggle('is-active', wholeNe);
      sectionNeButton.classList.toggle('hidden', optionAbsent);

      sectionNeButton.innerHTML = wholeNe
        ? `<strong>Réactiver la rubrique</strong>
           <span>${escapeHtml(section.neReason || 'Annuler le NE de toute la rubrique')}</span>`
        : `<strong>NE — Toute la rubrique</strong>
           <span>Déclarer cette rubrique non évaluée</span>`;
    }

    const list = $('#pointList');
    list.replaceChildren();

    if (isSupplementarySection(section) && section.points.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'empty-state';
      empty.textContent =
        'Aucun contrôle supplémentaire. Ajoutez uniquement les points nécessaires à cette machine.';
      list.appendChild(empty);
    }

    section.points.forEach((point, index) => {
      const row = document.createElement('div');
      row.className = `inspection-point is-${point.status}${point.optional ? ' is-optional' : ''}`;

      const statusAria = point.status === 'na'
        ? `Activer l'option : ${point.label}`
        : `Valider conforme : ${point.label}`;

      row.innerHTML = `
        <span class="point-index">${String(index + 1).padStart(2, '0')}</span>
        <button class="point-label-button" type="button" data-point-finding="${escapeHtml(point.id)}">
          ${escapeHtml(point.label)}
          ${point.optional
            ? `<small class="point-option-badge ${optionalPointIsPresent(point, section) ? 'is-present' : 'is-absent'}">${optionalPointIsPresent(point, section) ? 'OPTION · PRÉSENTE' : 'OPTION · ABSENTE'}</small>`
            : ''}
        ${point.photoRequired
  ? `<small class="point-option-badge ${pointHasRequiredPhoto(point) ? 'is-photo-ok' : 'is-photo-required'}">
      ${pointHasRequiredPhoto(point) ? '📷 PHOTO OK' : '📷 PHOTO OBLIGATOIRE'}
    </small>`
  : ''}
          ${point.status === 'ne' && point.neReason
            ? `<small class="point-ne-reason">${escapeHtml(point.neReason)}</small>`
            : ''}
        </button>

        <span class="point-inline-actions">
          <button
            class="point-status-button"
            type="button"
            data-point-conform="${escapeHtml(point.id)}"
            aria-label="${escapeHtml(statusAria)}"
          >
            <span class="point-status" aria-hidden="true">${pointStatusIcon(point.status)}</span>
          </button>

          ${isSupplementarySection(section)
            ? `<span class="supplementary-point-tools">
                 <button
                   type="button"
                   class="supplementary-finding-button${point.findingId ? ' has-finding' : ''}"
                   data-supplementary-finding="${escapeHtml(point.id)}"
                 >${point.findingId ? '⚠ Modifier constat' : '⚠ Constat'}</button>
                 <button type="button" data-edit-supplementary="${escapeHtml(point.id)}" aria-label="Modifier l’intitulé">✎</button>
                 <button type="button" data-delete-supplementary="${escapeHtml(point.id)}" aria-label="Supprimer le contrôle">🗑</button>
               </span>`
            : ''}
        </span>`;

      row.querySelector('[data-point-conform]').addEventListener('click', () => setPointConform(point.id));

      row.querySelector('[data-supplementary-finding]')
        ?.addEventListener('click', async event => {
          event.stopPropagation();
          state.activePointId = point.id;
          await openFindingForm();
        });

      row.querySelector('[data-edit-supplementary]')
        ?.addEventListener('click', event => {
          event.stopPropagation();
          editSupplementaryControl(point.id);
        });

      row.querySelector('[data-delete-supplementary]')
        ?.addEventListener('click', async event => {
          event.stopPropagation();
          await deleteSupplementaryControl(point.id);
        });

      row.querySelector('[data-point-finding]').addEventListener('click', () => {
        if (
          isOptionalEquipmentSection(section) &&
          section.optionPresent !== true
        ) {
          toast('Activez d’abord cette option / cet équipement.');
          return;
        }

        state.activePointId = point.id;
        openFindingForm();
      });

      list.appendChild(row);
    });
  }

  function openPointActions(pointId) {
    const section = currentSection();
    const point = section?.points?.find(item => item.id === pointId);
    if (!point) return;
    state.activePointId = pointId;
    $('#pointActionTitle').textContent = point.label;
    $('#pointActionDialog').classList.remove('hidden');
    $('#pointActionDialog').setAttribute('aria-hidden', 'false');
  }

  function closePointActions() {
    $('#pointActionDialog').classList.add('hidden');
    $('#pointActionDialog').setAttribute('aria-hidden', 'true');
  }

  async function setPointConform(pointId = state.activePointId) {
    if (!markVisitDraft()) return;

    const section = currentSection();
    state.activePointId = pointId;
    const point = section?.points?.find(item => item.id === pointId);
    if (!point) return;

    clearWholeSectionStatus(section);

    // Pour une rubrique entièrement optionnelle, un premier clic active
    // l'équipement complet afin que tous ses contrôles deviennent applicables.
    if (
      point.optional &&
      isOptionalEquipmentSection(section) &&
      section.optionPresent !== true
    ) {
      closePointActions();
      await setOptionalEquipmentPresence(section, true);
      return;
    }

    // Pour une option isolée dans une rubrique mixte, le premier clic
    // mémorise sa présence puis remet le point à contrôler.
    if (point.optional && point.status === 'na' && point.defaultStatus === 'na') {
      point.optionPresent = true;
      point.status = 'pending';
      point.findingId = null;
      point.neReason = '';
      point.neComment = '';

      recalculateSection(section);
      saveActiveVisit();
      closePointActions();
      renderInspection();

      toast('Option présente : point à contrôler.');
      return;
    }

    if (
      point.photoRequired === true &&
      point.status !== 'na' &&
      point.status !== 'ne' &&
      !pointHasRequiredPhoto(point)
    ) {
      await openRequiredPhotoPoint(
        point,
        `Photo obligatoire manquante : ${point.label}.`
      );
      return;
    }

    if (point.status === 'conform') {
      point.status =
        point.optional && optionalPointIsPresent(point, section)
          ? 'pending'
          : (point.optional ? 'na' : 'pending');

      point.findingId = null;
      point.neReason = '';
      point.neComment = '';

      recalculateSection(section);
      saveActiveVisit();
      closePointActions();
      renderInspection();

      toast(
        point.optional && optionalPointIsPresent(point, section)
          ? 'Validation annulée : option toujours présente, point remis à contrôler.'
          : point.optional
            ? 'Point remis en N/A.'
            : 'Validation annulée : point remis à contrôler.'
      );
      return;
    }

    const canReplace = await confirmReplaceFinding(point, 'Conforme');
    if (!canReplace) return;

    if (point.optional && !isOptionalEquipmentSection(section)) {
      point.optionPresent = true;
    }

    point.status = 'conform';
    point.findingId = null;
    point.neReason = '';
    point.neComment = '';

    recalculateSection(section);
    saveActiveVisit();
    closePointActions();

    if (sectionProgress(section).remaining === 0) {
      returnAfterSectionCompletion({
        zone: state.activeZone,
        section,
        message: 'Rubrique terminée.'
      });
      return;
    }

    renderInspection();
    toast('Point enregistré conforme.');
  }

  async function validateWholeSection() {
    if (!markVisitDraft()) return;
    const section = currentSection();
    if (!section) return;

    const missingPhotos = missingRequiredPhotos(section);

    if (missingPhotos.length > 0) {
      const labels = missingPhotos.map(point => point.label).join(' · ');

      await openRequiredPhotoPoint(
        missingPhotos[0],
        `Validation impossible : photo obligatoire manquante — ${labels}.`
      );
      return;
    }

    if (section.points.some(point => !['pending', 'na'].includes(point.status))) {
      toast('La validation globale n’est disponible qu’avant le contrôle détaillé.');
      return;
    }

    clearWholeSectionStatus(section);

    section.points.forEach(point => {
      if (point.status === 'pending') {
        point.status = 'conform';
        point.findingId = null;
        point.neReason = '';
        point.neComment = '';
      }
    });

    recalculateSection(section);
    saveActiveVisit();

    returnAfterSectionCompletion({
      zone: state.activeZone,
      section,
      message: 'Rubrique validée ; les points N/A sont conservés.'
    });
  }

  async function openFindingForm(options = {}) {
    const section = currentSection();
    const point = section?.points?.find(item => item.id === state.activePointId);
    if (!point) return;

    const existing = point.findingId
      ? state.activeVisit.findings.find(finding => finding.id === point.findingId)
      : null;

    // Règle métier :
    // Plaques constructeur et Vue d’ensemble servent d’abord à enregistrer
    // la photo obligatoire. Sans constat déjà existant, l'ouverture est donc
    // toujours en mode PHOTO, même si l'utilisateur clique sur le libellé.
    const automaticPortalPhotoFlow =
      isPortalPhotoPoint(point) &&
      !existing;

    const requestedPortalFlow =
      (
        options.requiredPhotoPortalFlow === true ||
        automaticPortalPhotoFlow
      ) &&
      isPortalPhotoPoint(point);

    if (requestedPortalFlow) {
      state.requiredPhotoPortalFlow = true;
      state.requiredPhotoPointId = point.id;
      state.requiredPhotoSectionId = state.activeSectionId;
      state.requiredPhotoZone = state.activeZone;
    } else if (options.preserveRequiredPhotoContext !== true) {
      state.requiredPhotoPortalFlow = false;
      state.requiredPhotoPointId = null;
      state.requiredPhotoSectionId = null;
      state.requiredPhotoZone = null;
    }

    closePointActions();
    $('#findingPointLabel').textContent = point.label;

    const levelField = $('#findingLevel');

    if (levelField) {
      if (!levelField.dataset.defaultFirstOption && levelField.options?.length) {
        levelField.dataset.defaultFirstOption =
          levelField.options[0].textContent || 'Choisir un niveau...';
      }

      levelField.value = existing?.level || '';
      levelField.required = !state.requiredPhotoPortalFlow;

      // IMPORTANT :
      // ne jamais masquer le parent du select. Dans le HTML actuel,
      // ce parent englobe aussi Commentaire + Photos + boutons.
      // Le champ reste visible mais devient simplement facultatif
      // et désactivé dans le flux photo obligatoire.
      levelField.disabled = state.requiredPhotoPortalFlow;

      if (levelField.options?.length) {
        levelField.options[0].textContent = state.requiredPhotoPortalFlow
          ? 'Non requis pour cette photo'
          : (levelField.dataset.defaultFirstOption || 'Choisir un niveau...');
      }
    levelField.dataset.level = levelField.value;

if (!levelField.dataset.levelStyleBound) {
  levelField.addEventListener('change', () => {
    levelField.dataset.level = levelField.value;
  });

  levelField.dataset.levelStyleBound = '1';
}}

    $('#findingComment').value = existing?.comment || '';
    $('#findingFormTitle').textContent = state.requiredPhotoPortalFlow
      ? `Photo obligatoire — ${point.label}`
      : (existing ? 'Modifier le constat' : 'Ajouter un constat');

    $('#findingDelete').classList.toggle(
      'hidden',
      state.requiredPhotoPortalFlow || !existing
    );

    const findingNa = $('#findingSetNa');
    const findingNe = $('#findingSetNe');
    if (findingNa) findingNa.classList.toggle('is-active', point.status === 'na');
    if (findingNe) findingNe.classList.toggle('is-active', point.status === 'ne');

    const statusText = $('#findingCurrentStatusText');
    const resetButton = $('#findingResetPoint');

    if (statusText) {
      statusText.textContent = state.requiredPhotoPortalFlow
        ? 'Photo obligatoire · niveau de criticité non requis'
        : pointStatusLabel(point);
    }

    if (resetButton) {
      resetButton.classList.toggle(
        'hidden',
        state.requiredPhotoPortalFlow || point.status === 'pending'
      );
    }

    
    state.draftFindingId = existing?.id || null;

if (state.requiredPhotoPortalFlow && !existing) {
  const linkedIds = new Set(
    linkedPhotoIdsForPoint(point.id, state.activeVisit)
  );

  state.draftPhotos = (state.activeVisit.photoLibrary || [])
    .filter(photo => linkedIds.has(photo.id))
    .map(photo => ({ ...photo }));

} else {
  state.draftPhotos = (existing?.photos || [])
    .map(photo => ({ ...photo }));
}

state.originalPhotoIds = state.draftPhotos.map(photo => photo.id);
state.removedPhotoIds = [];
const cancelButton = $('#findingCancel');
const saveButton = $('#findingSave');

if (cancelButton) {
  cancelButton.textContent =
    state.requiredPhotoPortalFlow ? 'Fermer' : 'Annuler';
}

if (saveButton) {
  saveButton.classList.toggle(
    'hidden',
    state.requiredPhotoPortalFlow
  );
}

    await renderPhotoGallery();
    showScreen('findingForm');
  }

  async function saveFinding() {
    if (!markVisitDraft()) return;
    const section = currentSection();
    const point = section?.points?.find(item => item.id === state.activePointId);
    if (!point) return;
    const existingFinding = point.findingId
      ? state.activeVisit.findings.find(finding => finding.id === point.findingId)
      : null;

    const photoOnlyFlow =
      isPortalPhotoPoint(point) &&
      !existingFinding;

    if (photoOnlyFlow) {
      state.requiredPhotoPortalFlow = true;
      state.requiredPhotoPointId = point.id;
      state.requiredPhotoSectionId = section.id;
      state.requiredPhotoZone = state.activeZone;
    }

    const level = photoOnlyFlow
      ? ''
      : $('#findingLevel').value;

    if (!photoOnlyFlow && !level) {
      return toast('Choisissez le niveau du constat.');
    }

    // Dans le flux « photo obligatoire », le bouton Enregistrer ne crée pas
    // un constat : il suffit d'ajouter la photo. Le point sera ensuite
    // automatiquement validé Conforme et retournera au portail.
   if (photoOnlyFlow) {
  const draftIds = new Set(
    state.draftPhotos.map(photo => photo.id)
  );

  // Met à jour les liaisons entre la bibliothèque
  // et le point photo obligatoire.
  (state.activeVisit.photoLibrary || []).forEach(photo => {
    if (!photo?.id) return;

    const linkedIds = Array.isArray(photo.linkedPointIds)
      ? [...photo.linkedPointIds]
      : [];

    const wasOriginallyLinked =
      state.originalPhotoIds.includes(photo.id);

    const mustStayLinked =
      draftIds.has(photo.id);

    // Photo retirée de ce point
    if (wasOriginallyLinked && !mustStayLinked) {
      photo.linkedPointIds =
        linkedIds.filter(id => id !== point.id);

      if (photo.pointId === point.id) {
        photo.pointId =
          photo.linkedPointIds[0] || null;
      }
    }

    // Photo présente dans le brouillon :
    // on garantit qu'elle est liée au point.
    if (mustStayLinked) {
      linkPhotoToPoint(photo, point.id);
    }
  });

  clearWholeSectionStatus(section);

  point.findingId = null;
  point.neReason = '';
  point.neComment = '';

  if (state.draftPhotos.length > 0) {
    // Il reste au moins une photo
    point.status = 'conform';
  } else {
    // Plus aucune photo : le point redevient à traiter
    point.status = 'pending';
  }

  recalculateSection(section);
  saveActiveVisit();

  const hasPhoto = state.draftPhotos.length > 0;
  const pointLabel = point.label;

  state.draftPhotos = [];
  state.draftFindingId = null;
  state.originalPhotoIds = [];
  state.removedPhotoIds = [];

  state.requiredPhotoPortalFlow = false;
  state.requiredPhotoPointId = null;
  state.requiredPhotoSectionId = null;
  state.requiredPhotoZone = null;

  state.activePointId = null;

  restoreFindingCriticalityUi();
  clearPhotoObjectUrls();

  renderDashboard();
  showScreen('dashboard');

  toast(
    hasPhoto
      ? `${pointLabel} : modification enregistrée · Conforme.`
      : `${pointLabel} : photo supprimée · Photo obligatoire.`
  );

  return;
}

    

    clearWholeSectionStatus(section);

    const existingIndex = point.findingId ? state.activeVisit.findings.findIndex(finding => finding.id === point.findingId) : -1;
    const finding = {
      id: point.findingId || `F-${Date.now()}`,
      zone: state.activeZone,
      sectionId: section.id,
      sectionLabel: section.label,
      pointId: point.id,
      pointLabel: point.label,
      title: point.label,
      level,
      comment: $('#findingComment').value.trim(),
      photos: state.draftPhotos.map(photo => ({ ...photo })),
      status: 'Enregistré',
      updatedAt: new Date().toISOString()
    };
    await Promise.all(state.removedPhotoIds.map(id => photoDbDelete(id).catch(console.error)));
    if (existingIndex >= 0) state.activeVisit.findings[existingIndex] = finding;
    else state.activeVisit.findings.push(finding);
    if (point.optional && !isOptionalEquipmentSection(section)) {
      point.optionPresent = true;
    }

    point.status = 'finding';
    point.findingId = finding.id;
    point.neReason = '';
    point.neComment = '';
    const tyre = findTyre(point.id);
    if (tyre) tyre.findingId = finding.id;
    recalculateSection(section);
    saveActiveVisit();
    state.draftPhotos = [];
    state.draftFindingId = null;
    state.originalPhotoIds = [];
    state.removedPhotoIds = [];
    state.requiredPhotoPortalFlow = false;
    state.requiredPhotoPointId = null;
    state.requiredPhotoSectionId = null;
    state.requiredPhotoZone = null;
    restoreFindingCriticalityUi();
    clearPhotoObjectUrls();
    if (state.activeSectionId === 'tyres') { renderTyreInspection(); showScreen('tyres'); }
    else { renderInspection(); showScreen('inspection'); }
    toast('Constat enregistré.');
  }

  async function deleteFinding() {
    if (!markVisitDraft()) return;
    const section = currentSection();
    const point = section?.points?.find(item => item.id === state.activePointId);
    if (!point?.findingId) return;
    const finding = state.activeVisit.findings.find(item => item.id === point.findingId);
    await deleteFindingPhotos(finding);
    state.activeVisit.findings = state.activeVisit.findings.filter(item => item.id !== point.findingId);
    point.findingId = null;
    const tyre = findTyre(point.id);
    if (tyre) {
      tyre.findingId = null;
      point.status = tyreValueToPointStatus(tyre.value);
    } else {
      point.status =
        point.optional && optionalPointIsPresent(point, section)
          ? 'pending'
          : (point.defaultStatus === 'na' ? 'na' : 'pending');
    }
    point.neReason = '';
    point.neComment = '';
    state.draftPhotos = [];
    state.draftFindingId = null;
    state.originalPhotoIds = [];
    state.removedPhotoIds = [];
    state.requiredPhotoPortalFlow = false;
    state.requiredPhotoPointId = null;
    state.requiredPhotoSectionId = null;
    state.requiredPhotoZone = null;
    recalculateSection(section);
    saveActiveVisit();
    if (state.activeSectionId === 'tyres') { renderTyreInspection(); showScreen('tyres'); }
    else { renderInspection(); showScreen('inspection'); }
    toast('Constat supprimé.');
  }

  async function cancelFindingForm() {
    
    
    state.draftPhotos = [];
    state.draftFindingId = null;
    state.originalPhotoIds = [];
    state.removedPhotoIds = [];
    state.requiredPhotoPortalFlow = false;
    state.requiredPhotoPointId = null;
    state.requiredPhotoSectionId = null;
    state.requiredPhotoZone = null;
    restoreFindingCriticalityUi();
    clearPhotoObjectUrls();
    if (state.activeSectionId === 'tyres') { renderTyreInspection(); showScreen('tyres'); }
    else { renderInspection(); showScreen('inspection'); }
  }

  function renderZone(zone) {
    if (!zoneEnabled(state.activeVisit, zone)) {
      toast(`${zoneDisplayLabel(state.activeMachine, zone, state.activeVisit)} n’est pas inclus dans cette visite.`);
      return;
    }

    if (
      zone === 'upper' &&
      cbEquipmentRequired() &&
      !cbEquipmentComplete()
    ) {
      const missing = cbEquipmentMissingFields();
      toast(`Complétez l’identification du bras : ${cbEquipmentMissingLabel(missing)}.`);
      focusFirstMissingCbEquipmentField();
      return;
    }

    if (
      zone === 'upper' &&
      cnEquipmentRequired() &&
      !cnEquipmentComplete()
    ) {
      const missing = cnEquipmentMissingFields();
      toast(`Complétez l’identification de la nacelle : ${cnEquipmentMissingLabel(missing)}.`);
      focusFirstMissingCnEquipmentField();
      return;
    }

    state.activeZone = zone;
    const label = zoneDisplayLabel(state.activeMachine, zone, state.activeVisit);
    const progress = zoneProgress(state.activeVisit, zone);
    $('#zoneTitle').textContent = label;
    const zoneSections = state.activeVisit.zones?.[zone]?.sections || [];
    const remainingSections = zoneSections.filter(section =>
      sectionProgress(section).remaining > 0
    ).length;

    const extraProgress = supplementaryProgress(state.activeVisit, zone);
    const extraText = extraProgress.remaining > 0
      ? ` · ${extraProgress.remaining} contrôle(s) supplémentaire(s) restant(s)`
      : '';

    $('#zoneSubtitle').textContent =
      `${state.activeMachine.parkNumber || state.activeMachine.id} · ` +
      `${state.activeMachine.model || state.activeMachine.designation || ''} · ` +
      `${remainingSections} rubrique(s) standard restante(s)` +
      extraText;
    $('#zoneProgress').textContent = progress.remaining === 0
      ? '✓ Terminé'
      : `${progress.remaining}/${progress.total}`;
    const ncButton = $('#showZoneNc');
    ncButton.textContent = `Constats ${progress.ncTotal}`;
    ncButton.classList.toggle('hidden', progress.ncTotal === 0);
    if ($('#sectionSearch')) $('#sectionSearch').value = '';
    renderSectionList();
    showScreen('zone');
  }

  function findingsFor(zone, sectionId = null) {
    return (state.activeVisit?.findings || []).filter(finding => {
      const sameZone = finding.zone === zone || finding.area === zone;
      const sameSection = !sectionId || finding.sectionId === sectionId;
      return sameZone && sameSection;
    });
  }

  function openFindings(zone, sectionId = null) {
    const label = zoneDisplayLabel(state.activeMachine, zone, state.activeVisit);
    const standardSection = sectionId
      ? state.activeVisit?.zones?.[zone]?.sections?.find(item => item.id === sectionId)
      : null;

    const extraSection = sectionId === `supplementary-${zone}`
      ? supplementarySection(zone)
      : null;

    const section = standardSection || extraSection;
    $('#findingsTitle').textContent = section ? `Constats · ${section.label}` : `Constats ${label}`;
    $('#findingsSubtitle').textContent = `${state.activeMachine.parkNumber || state.activeMachine.id} · enregistrés et en cours`;
    const list = $('#findingsList');
    const findings = findingsFor(zone, sectionId);
    list.replaceChildren();
    if (!findings.length) {
      const empty = document.createElement('div');
      empty.className = 'empty-findings';
      empty.textContent = 'Aucun constat dans cette rubrique.';
      list.appendChild(empty);
    } else {
      findings.forEach(finding => {
        const row = document.createElement('button');
        row.type = 'button';
        row.className = 'finding-row';
        row.innerHTML = `<strong>${escapeHtml(finding.title || finding.pointLabel || 'Constat')}</strong><span>${escapeHtml(finding.comment || finding.description || '')}</span><span class="finding-status">${escapeHtml(finding.status || 'Enregistré')}</span>`;
        row.addEventListener('click', () => { state.activeZone = finding.zone; state.activeSectionId = finding.sectionId; state.activePointId = finding.pointId; openFindingForm(); });
        list.appendChild(row);
      });
    }
    showScreen('findings');
  }


  function ensureDashboardNeUi(zone) {
    const ncButton = $(`#${zone}Nc`);
    if (!ncButton) return null;

    let neBadge = $(`#${zone}Ne`);

    if (!neBadge) {
      neBadge = document.createElement('div');
      neBadge.id = `${zone}Ne`;
      neBadge.className = 'dashboard-ne-highlight hidden';
      neBadge.setAttribute('aria-label', 'Points non évalués');
      ncButton.insertAdjacentElement('afterend', neBadge);
    }

    if (!document.getElementById('vfg-dashboard-ne-style')) {
      const style = document.createElement('style');
      style.id = 'vfg-dashboard-ne-style';
      style.textContent = `
        .dashboard-ne-highlight {
          box-sizing: border-box;
          width: 100%;
          padding: 9px 12px 10px;
          border-top: 1px solid #e4e4e4;
          text-align: center;
          font-size: 15px;
          font-weight: 950;
          letter-spacing: .01em;
          background: #fff7ed;
          color: #b54708;
        }
        .dashboard-ne-highlight.hidden {
          display: none;
        }
      `;
      document.head.appendChild(style);
    }

    return neBadge;
  }

  function renderProgress(zone, progress) {
    const progressNode = $(`#${zone}Progress`);

    if (progressNode) {
      progressNode.textContent = progress.remaining === 0
        ? '✓ Terminé'
        : `${progress.remaining}/${progress.total}`;
    }

    const button = $(`#${zone}Nc`);
    button.textContent = `Constats ${progress.ncTotal}`;
    button.classList.toggle('hidden', progress.ncTotal === 0);

    const neBadge = ensureDashboardNeUi(zone);
    if (neBadge) {
      const neTotal = Number(progress.neTotal || 0);
      neBadge.textContent = `NE ${neTotal}`;
      neBadge.classList.toggle('hidden', neTotal === 0);
    }
  }

  function markVisitDraft() {
    const visit = state.activeVisit;
    if (!visit) return false;

    if (visit.status === 'Terminée' || visit.status === 'Synchronisée') {
      const confirmed = confirm(
        `Cette visite est ${visit.status.toLowerCase()}.

` +
        `La rouvrir en brouillon pour effectuer cette modification ?`
      );

      if (!confirmed) {
        toast('Modification annulée : la visite reste terminée.');
        return false;
      }

      reopenVisitForEdit(visit);
      persistVisitRecord(visit, { touch: true, sync: true });
      renderDashboard();
    }

    return true;
  }

  function saveActiveVisit() {
    if (!state.activeVisit) return;

    lockCraneFamilyIfNeeded(state.activeVisit, state.activeMachine);
    persistVisitRecord(state.activeVisit, { touch: true, sync: true });
  }

  function readingValue(input) {
    const raw = String(input.value ?? '').replace(/[\s\u00A0\u202F]/g, '').replace(/[^0-9]/g, '');
    if (raw === '') return null;
    const value = Number(raw);
    return Number.isFinite(value) && value >= 0 ? value : null;
  }

  function formatReading(value) {
    if (value === null || value === undefined || value === '') return '';
    const number = Number(String(value).replace(/[\s\u00A0\u202F]/g, '').replace(/[^0-9]/g, ''));
    return Number.isFinite(number) ? new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(number) : '';
  }

  function formatReadingField(input) {
    const value = readingValue(input);
    input.value = value === null ? '' : formatReading(value);
  }

  function saveDashboardReadings() {
    if (!markVisitDraft()) return;
    const visit = state.activeVisit;
    if (!visit) return;
    visit.visitDate = $('#dashboardVisitDate').value || todayIsoDate();
    visit.carrierKm = readingValue($('#dashboardCarrierKm'));
    visit.carrierHours = readingValue($('#dashboardCarrierHours'));
    visit.upperHours = readingValue($('#dashboardUpperHours'));
    saveActiveVisit();
  }

  function saveControllerDetails() {
    if (!markVisitDraft()) return;
    const visit = state.activeVisit;
    if (!visit) return;
    visit.controllerName = $('#dashboardControllerName').value.trim();
    visit.controllerEmail = $('#dashboardControllerEmail').value.trim();
    visit.controllerPhone = $('#dashboardControllerPhone').value.trim();
    saveJson(STORAGE_KEYS.controllerProfile, {
      name: visit.controllerName,
      email: visit.controllerEmail,
      phone: visit.controllerPhone
    });
    saveActiveVisit();
  }

  function bindControllerSequence() {
    const fields = [
      $('#dashboardControllerName'),
      $('#dashboardControllerEmail'),
      $('#dashboardControllerPhone')
    ];
    fields.forEach((field, index) => {
      field.addEventListener('change', saveControllerDetails);
      field.addEventListener('blur', saveControllerDetails);
      field.addEventListener('keydown', event => {
        if (event.key !== 'Enter') return;
        event.preventDefault();
        saveControllerDetails();
        const next = fields[index + 1];
        if (next) next.focus();
        else field.blur();
      });
    });
  }

  function bindReadingSequence() {
    const fields = [
      $('#dashboardVisitDate'),
      $('#dashboardCarrierKm'),
      $('#dashboardCarrierHours'),
      $('#dashboardUpperHours')
    ];
    fields.forEach((field, index) => {
      const isReading = field.type !== 'date';
      field.addEventListener('focus', () => {
        if (isReading) {
          const value = readingValue(field);
          field.value = value === null ? '' : String(value);
          field.select();
        }
      });
      field.addEventListener('input', () => {
        if (isReading) field.value = field.value.replace(/[^0-9]/g, '');
      });
      field.addEventListener('change', () => {
        saveDashboardReadings();
        if (isReading) formatReadingField(field);
      });
      field.addEventListener('blur', () => {
        saveDashboardReadings();
        if (isReading) formatReadingField(field);
      });
      field.addEventListener('keydown', event => {
        if (event.key !== 'Enter') return;
        event.preventDefault();
        saveDashboardReadings();
        if (isReading) formatReadingField(field);
        const next = fields[index + 1];
        if (next) {
          next.focus();
          if (typeof next.select === 'function' && next.type !== 'date') next.select();
        } else {
          field.blur();
        }
      });
    });
  }

  function renderDashboard() {
    const machine = state.activeMachine;
    const visit = state.activeVisit;
    $('#dashboardTitle').textContent = `${machine.parkNumber || machine.id} – ${machine.model || machine.designation || 'Machine'}`;
    $('#dashboardSubtitle').textContent = [
      machine.brand,
      machine.serialNumber ? `Série ${machine.serialNumber}` : '',
      machine.agency,
      visit.status ? `Statut : ${visit.status}` : ''
    ].filter(Boolean).join(' · ');
    $('#dashboardVisitDate').value = visit.visitDate || todayIsoDate();
    $('#dashboardCarrierKm').value = Number.isFinite(Number(visit.carrierKm)) ? formatReading(visit.carrierKm) : '';
    $('#dashboardCarrierHours').value = Number.isFinite(Number(visit.carrierHours)) ? formatReading(visit.carrierHours) : '';
    $('#dashboardUpperHours').value = Number.isFinite(Number(visit.upperHours)) ? formatReading(visit.upperHours) : '';
    $('#dashboardControllerName').value = visit.controllerName || '';
    $('#dashboardControllerEmail').value = visit.controllerEmail || '';
    $('#dashboardControllerPhone').value = visit.controllerPhone || '';
    renderProgress('carrier', zoneProgress(visit, 'carrier'));
    renderProgress('upper', zoneProgress(visit, 'upper'));

    ensureVisitScope(visit, machine);

    for (const zone of ['carrier', 'upper']) {
      const enabled = zoneEnabled(visit, zone);
      const card = document.querySelector(`.dashboard-card[data-zone="${zone}"]`);
      const main = card?.querySelector('.dashboard-main');
      const progress = $(`#${zone}Progress`);
      const ncButton = $(`#${zone}Nc`);

      const zoneProgressValue = zoneProgress(visit, zone);
      const complete = enabled && zoneProgressValue.remaining === 0;

      card?.classList.toggle('is-zone-disabled', !enabled);
      card?.classList.toggle('is-zone-complete', complete);

      if (main) {
        main.disabled = !enabled;
        main.setAttribute('aria-disabled', String(!enabled));
      }

      if (!enabled) {
        if (progress) progress.textContent = 'N/A';
        if (ncButton) ncButton.classList.add('hidden');
      }
    }

    const carrierEnabled = zoneEnabled(visit, 'carrier');
    const upperEnabled = zoneEnabled(visit, 'upper');

    $('#dashboardCarrierKm').disabled = !carrierEnabled;
    $('#dashboardCarrierHours').disabled = !carrierEnabled;
    $('#dashboardUpperHours').disabled = !upperEnabled;

    const mkRow = $('#mkOptionRow');
    const mkCheckbox = $('#dashboardMkMode');
    const mkAvailable = String(machine.category || '').toUpperCase() === 'GM';
    const mkLocked = craneFamilyIsLocked(machine, visit);

    if (mkRow && mkCheckbox) {
      mkRow.classList.toggle('hidden', !mkAvailable);
      mkCheckbox.disabled = !mkAvailable || mkLocked;
      mkCheckbox.checked = machineFamily(machine, visit) === 'MK';

      const label = mkRow.querySelector('label') || mkRow;
      if (label) {
        label.title = mkLocked
          ? `Référentiel ${craneFamilyLabel(machine, visit)} verrouillé après le début du contrôle.`
          : 'Le type GM/MK peut être modifié avant le premier point traité.';
      }
    }

    // Rend le type de référentiel visible sans dépendre du rapport.
    const family = machineFamily(machine, visit);
    $('#dashboardTitle').dataset.vfgFamily = family;

    refreshZoneLabels();
    renderCbEquipmentIdentity();
    renderCnEquipmentIdentity();
    refreshVisitScopeSummary();
    renderSupplementaryDashboardStatus();
    refreshFinishVisitButton();
  }

  async function startNewVisit() {
    const machine = state.activeMachine;
    if (!machine) return toast('Aucune machine sélectionnée.');

    const profile = loadJson(STORAGE_KEYS.controllerProfile, {});
    const visit = await createVisitWithScope(machine);
    if (!visit) return;

    visit.controllerName = profile.name || '';
    visit.controllerEmail = profile.email || '';
    visit.controllerPhone = profile.phone || '';

    state.activeVisit = visit;
    saveActiveVisit();
    renderDashboard();
    showScreen('dashboard');

    toast(`Nouvelle visite créée · ${visitScopeLabel(machine, visit)}.`);
  }
function showVisitChoiceDialog(machine, machineVisits) {
  return new Promise(resolve => {
    const overlay = document.createElement('div');

    Object.assign(overlay.style, {
      position: 'fixed',
      inset: '0',
      background: 'rgba(0,0,0,.45)',
      zIndex: '99999',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '18px'
    });

    const dialog = document.createElement('div');

    Object.assign(dialog.style, {
      background: '#fff',
      borderRadius: '22px',
      width: '100%',
      maxWidth: '560px',
      maxHeight: '85vh',
      overflowY: 'auto',
      padding: '22px',
      boxSizing: 'border-box',
      boxShadow: '0 20px 60px rgba(0,0,0,.3)'
    });

    const title = document.createElement('h2');
    title.textContent =
      `Visites de ${machine.parkNumber || machine.id}`;

    Object.assign(title.style, {
      margin: '0 0 18px',
      fontSize: '24px'
    });

    dialog.appendChild(title);

    function closeWith(value) {
      overlay.remove();
      resolve(value);
    }

    machineVisits.forEach((visit, index) => {
      const safeVisit = ensureVisitSchema(visit, machine).visit;
      const date = formatVisitDate(safeVisit.visitDate);
      const status = safeVisit.status || 'Enregistrée';

      const syncLabel =
        safeVisit.syncStatus === 'synchronisée'
          ? 'Synchronisée'
          : 'À synchroniser';

      const controller =
        safeVisit.controllerName
          ? ` · ${safeVisit.controllerName}`
          : '';

      const scope = visitScopeLabel(machine, safeVisit);
      const progress = visitProgressSummary(safeVisit);

      const progressText =
        progress.total > 0
          ? `${progress.controlled}/${progress.total} traité(s)`
          : 'aucun point applicable';

      const row = document.createElement('div');

      Object.assign(row.style, {
        border: '1px solid #ddd',
        borderRadius: '16px',
        marginBottom: '12px',
        overflow: 'hidden'
      });

      const openButton = document.createElement('button');
      openButton.type = 'button';

      openButton.textContent =
        `${index + 1} — ${date}\n` +
        `${status} · ${syncLabel}${controller}\n` +
        `${scope} · ${progressText}`;

      Object.assign(openButton.style, {
        width: '100%',
        border: '0',
        background: '#fff',
        padding: '16px',
        textAlign: 'left',
        fontSize: '17px',
        lineHeight: '1.35',
        whiteSpace: 'pre-line',
        cursor: 'pointer'
      });

      openButton.addEventListener('click', () => {
        closeWith(String(index + 1));
      });

      const deleteButton = document.createElement('button');
      deleteButton.type = 'button';
      deleteButton.textContent =
        `🗑️ Supprimer cette visite`;

      Object.assign(deleteButton.style, {
        width: '100%',
        border: '0',
        borderTop: '1px solid #eee',
        background: '#fff5f5',
        padding: '12px 16px',
        textAlign: 'left',
        fontSize: '15px',
        cursor: 'pointer'
      });

      deleteButton.addEventListener('click', () => {
        closeWith(`D${index + 1}`);
      });

      row.appendChild(openButton);
      row.appendChild(deleteButton);
      dialog.appendChild(row);
    });

    const newVisitButton = document.createElement('button');
    newVisitButton.type = 'button';
    newVisitButton.textContent = '＋ Créer une nouvelle visite';

    Object.assign(newVisitButton.style, {
      width: '100%',
      border: '0',
      borderRadius: '14px',
      background: '#f47721',
      color: '#fff',
      padding: '15px',
      fontSize: '17px',
      fontWeight: '700',
      margin: '6px 0 18px',
      cursor: 'pointer'
    });

    newVisitButton.addEventListener('click', () => {
      closeWith('0');
    });

    dialog.appendChild(newVisitButton);

    const label = document.createElement('label');
    label.textContent = 'Ou saisir votre choix :';
    label.style.display = 'block';
    label.style.marginBottom = '7px';

    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'Ex. 1, 0 ou D1';
    input.autocomplete = 'off';

    Object.assign(input.style, {
      width: '100%',
      boxSizing: 'border-box',
      padding: '13px',
      border: '1px solid #ccc',
      borderRadius: '12px',
      fontSize: '18px'
    });

    dialog.appendChild(label);
    dialog.appendChild(input);

    const actions = document.createElement('div');

    Object.assign(actions.style, {
      display: 'flex',
      gap: '10px',
      marginTop: '16px'
    });

    const cancelButton = document.createElement('button');
    cancelButton.type = 'button';
    cancelButton.textContent = 'Annuler';

    const okButton = document.createElement('button');
    okButton.type = 'button';
    okButton.textContent = 'OK';

    [cancelButton, okButton].forEach(button => {
      Object.assign(button.style, {
        flex: '1',
        padding: '13px',
        borderRadius: '12px',
        border: '1px solid #ddd',
        background: '#fff',
        fontSize: '17px'
      });
    });

    cancelButton.addEventListener('click', () => {
      closeWith(null);
    });

    okButton.addEventListener('click', () => {
      closeWith(input.value.trim());
    });

    input.addEventListener('keydown', event => {
      if (event.key === 'Enter') {
        closeWith(input.value.trim());
      }
    });

    actions.appendChild(cancelButton);
    actions.appendChild(okButton);

    dialog.appendChild(actions);
    overlay.appendChild(dialog);
    document.body.appendChild(overlay);
  });
}
async function openMachine(machine) {
  state.activeZone = null;
  state.activeMachine = machine;

  const visits = loadJson(STORAGE_KEYS.visits, []);
  const machineId = machineKey(machine);

  const machineVisits = visits
    .filter(visit =>
      visit.machineId === machineId ||
      visit.machineSnapshot?.id === machineId ||
      visit.machineSnapshot?.parkNumber === machineId
    )
    .sort((a, b) =>
      new Date(b.updatedAt || b.createdAt || 0) -
      new Date(a.updatedAt || a.createdAt || 0)
    );

  if (machineVisits.length >= 1) {
    const lines = machineVisits.map((visit, index) => {
      const safeVisit = ensureVisitSchema(visit, machine).visit;
      const date = formatVisitDate(safeVisit.visitDate);
      const status = safeVisit.status || 'Enregistrée';
      const syncLabel = safeVisit.syncStatus === 'synchronisée'
  ? 'Synchronisée'
  : 'À synchroniser';
      const controller = safeVisit.controllerName
        ? ` - ${safeVisit.controllerName}`
        : '';
      const scope = visitScopeLabel(machine, safeVisit);
      const progress = visitProgressSummary(safeVisit);
      const progressText = progress.total > 0
        ? `${progress.controlled}/${progress.total} traité(s)`
        : 'aucun point applicable';

     return `${index + 1} - ${date} - ${status} - ${syncLabel}${controller}\n` +
        `${scope} · ${progressText}\n` +
        `D${index + 1} - Supprimer cette visite`;
    });

  const choice = await showVisitChoiceDialog(
  machine,
  machineVisits
);

    if (choice === null) return;

    const selectedNumber = Number(choice);
const normalizedChoice = choice.trim().toUpperCase();

if (/^D\d+$/.test(normalizedChoice)) {
  const deleteNumber = Number(normalizedChoice.slice(1));

  if (
    deleteNumber >= 1 &&
    deleteNumber <= machineVisits.length
  ) {
    const visitToDelete = machineVisits[deleteNumber - 1];

    const confirmed = confirm(
      `Supprimer définitivement la visite du ${formatVisitDate(visitToDelete.visitDate)} ?`
    );

    if (!confirmed) return;

    const remainingVisits = visits.filter(
      visit => visit.id !== visitToDelete.id
    );

    saveJson(STORAGE_KEYS.visits, remainingVisits);
    deleteVisitFromServer(visitToDelete.id);

  toast('Visite supprimée.');

const hasRemainingVisits = remainingVisits.some(visit =>
  visit.machineId === machineId ||
  visit.machineSnapshot?.id === machineId ||
  visit.machineSnapshot?.parkNumber === machineId
);

if (hasRemainingVisits) {
  openMachine(machine);
} else {
  state.activeVisit = null;
  showScreen('search');
}

return;
  }

  toast('Numéro de visite incorrect.');
  return;
}
    if (selectedNumber === 0) {
      state.activeVisit = await createVisitWithScope(machine);
      if (!state.activeVisit) return;
      saveActiveVisit();
    } else if (
      Number.isInteger(selectedNumber) &&
      selectedNumber >= 1 &&
      selectedNumber <= machineVisits.length
    ) {
      const selectedVisit = machineVisits[selectedNumber - 1];
      state.activeVisit = activateExistingVisit(selectedVisit, machine);
      if (!state.activeVisit) return;
    } else {
      toast('Numéro de visite incorrect.');
      return;
    }

  } else if (machineVisits.length === 1) {
    state.activeVisit = activateExistingVisit(machineVisits[0], machine);
    if (!state.activeVisit) return;

  } else {
    state.activeVisit = await createVisitWithScope(machine);
    if (!state.activeVisit) return;
    saveActiveVisit();
  }

  rememberMachine(machine);

  if (!state.activeVisit.visitDate) {
    state.activeVisit.visitDate = todayIsoDate();
  }

  renderDashboard();
  showScreen('dashboard');
}

  function reportStatusLabel(status) {
    if (status === 'conform') return 'CONFORME';
    if (status === 'finding') return 'NON CONFORME';
    if (status === 'na') return 'N/A';
    if (status === 'ne') return 'NON ÉVALUÉ';
    return 'NON CONTRÔLÉ';
  }

  function reportPage(inner, page, total, title = 'Warranty Inspection System') {
  return `<article
    class="report-page"
    id="report-page-${page}"
    data-report-page="${page}"
  >
    <div class="report-page-header">
      <div class="report-brand">
        <span class="report-brand-mark"></span>
        <div>
          <strong>FOSELEV VFG</strong>
          <small>Warranty Inspection System</small>
        </div>
      </div>
      <span>${escapeHtml(title)}</span>
    </div>

    <div class="report-page-body">${inner}</div>

    <div class="report-page-footer">
      Page ${page} / ${total}
    </div>
  </article>`;
}

  function blobToDataUrl(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(reader.error || new Error('Lecture photo impossible.'));
      reader.readAsDataURL(blob);
    });
  }

  function reportFindingCategory(level) {
    const value = normalize(level || '');
    if (value.includes('information')) return 'observation';
    if (value.includes('surveiller')) return 'watch';
    return 'nonconformity';
  }

  function reportCategoryLabel(category) {
    if (category === 'watch') return 'À SURVEILLER';
    if (category === 'observation') return 'OBSERVATION';
    return 'NON-CONFORMITÉ';
  }

  function reportSectionHeading(number, title) {
    return `<div class="report-section-heading"><span>${escapeHtml(number)}</span><h2>${escapeHtml(title)}</h2></div>`;
  }

  function reportTyreState(value) {
    if (value === 'pending') return 'NON CONTRÔLÉ';
    return value === 'HS' ? 'HS' : `${value} %`;
  }

  function reportControlPage(section, zoneTitle, chapterNumber, visit) {
    if (section.id === 'tyres') {
      const axles = visit.tyres?.axles || [];
      const axleHtml = axles.map((axle, axleIndex) => {
        const left = axle.tyres.filter(t => t.side === 'left');
        const right = axle.tyres.filter(t => t.side === 'right');
        const tyre = item => `<span class="report-wheel report-wheel-${String(item.value).toLowerCase()}"><b>${reportTyreState(item.value)}</b><small>${item.position === 'inner' ? 'INT.' : item.position === 'outer' ? 'EXT.' : ''}</small></span>`;
        return `<div class="report-axle-diagram">
          <div class="report-axle-side report-axle-left">${left.map(tyre).join('')}</div>
          <div class="report-axle-center"><strong>ESSIEU ${axleIndex + 1}</strong><span>${axle.mode === 'dual' ? 'ROUES JUMELÉES' : 'ROUES SIMPLES'}</span></div>
          <div class="report-axle-side report-axle-right">${right.map(tyre).join('')}</div>
        </div>`;
      }).join('');
      return `${reportSectionHeading(chapterNumber, `${zoneTitle} · Pneumatiques`)}
        <p class="report-intro">État individuel de chaque pneumatique. Les valeurs à 25 % sont signalées « À surveiller ». Les pneumatiques HS sont classés en non-conformité.</p>
        <div class="report-tyre-diagram">${axleHtml || '<div class="report-empty">Aucune configuration pneumatique enregistrée.</div>'}</div>`;
    }
    const points = section.points || [];
    const lines = points.map(point => {
      const finding = point.findingId ? (visit.findings || []).find(item => item.id === point.findingId) : null;
      return `<tr>
        <td>${escapeHtml(point.label || '')}${finding?.comment ? `<small class="report-point-comment">${escapeHtml(finding.comment)}</small>` : ''}</td>
        <td class="report-status report-status-${point.status}">${reportStatusLabel(point.status)}</td>
      </tr>`;
    }).join('');
    return `${reportSectionHeading(chapterNumber, `${zoneTitle} · ${section.label}`)}
      <table class="report-control-table"><thead><tr><th>Point de contrôle</th><th>État</th></tr></thead><tbody>${lines}</tbody></table>`;
  }

  async function reportFindingPage(finding, index, detailPageNumber) {
    const selected = (finding.photos || []).filter(photo => photo.includeInReport);
    const images = [];
    for (const photo of selected.slice(0, 4)) {
      try {
        const stored = await photoDbGet(photo.id);
        if (stored?.blob) images.push(await blobToDataUrl(stored.blob));
      } catch (error) { console.warn('Photo rapport indisponible', error); }
    }
    const photos = images.length ? `<div class="report-finding-photos">${images.map((url, photoIndex) => `<figure><img src="${url}" alt="Photo ${photoIndex + 1} du constat"><figcaption>Photo ${photoIndex + 1}</figcaption></figure>`).join('')}</div>` : '<p class="report-no-photo">Aucune photo sélectionnée pour le rapport.</p>';
    return `${reportSectionHeading(String(index + 1).padStart(2, '0'), 'Détail de l’anomalie')}
      <div class="report-finding-card">
        <div><span>Zone</span><strong>${escapeHtml(finding.zone === 'upper' ? 'Tourelle' : 'Porteur')}</strong></div>
        <div><span>Rubrique</span><strong>${escapeHtml(finding.sectionLabel || '—')}</strong></div>
        <div><span>Point contrôlé</span><strong>${escapeHtml(finding.pointLabel || finding.title || '—')}</strong></div>
        <div><span>Niveau</span><strong>${escapeHtml(finding.level || '—')}</strong></div>
      </div>
      <section class="report-finding-comment"><h3>Constat du contrôleur</h3><p>${escapeHtml(finding.comment || 'Aucun commentaire.')}</p></section>
      ${photos}

<p class="report-detail-reference">
  Référence dans la synthèse : anomalie n° ${index + 1} · page ${detailPageNumber}
</p>

<a
  class="report-detail-back-link"
  href="#report-summary-page-${detailPageNumber}"
>
  ← Retour à l’anomalie dans la synthèse
</a>`;  }

 async function reportCoverPhoto(visit) {
  if (!visit) return '';

  const family = machineFamily(state.activeMachine, visit);

  // Photos obligatoires du portail :
  // documentation-001 = plaque(s) constructeur
  // documentation-006 = vue d'ensemble
  const plateIds = linkedPhotoIdsForPoint('documentation-001', visit);
  const overviewIds = linkedPhotoIdsForPoint('documentation-006', visit);

  const figures = [];
const usedPhotoIds = new Set();

async function addFirstAvailablePhoto(ids, label) {
  for (const id of ids) {
    if (!id || usedPhotoIds.has(id)) continue;

    try {
      const stored = await photoDbGet(id);

      if (!stored?.blob) continue;

      const url = await blobToDataUrl(stored.blob);

      figures.push(`
        <figure class="report-cover-photo">
          <img src="${url}" alt="${escapeHtml(label)}">
          <figcaption>${escapeHtml(label)}</figcaption>
        </figure>
      `);

      usedPhotoIds.add(id);
      return true;

    } catch (error) {
      console.warn('Photo indisponible :', id, error);
    }
  }

  return false;
}

await addFirstAvailablePhoto(
  overviewIds,
  'Vue d’ensemble'
);

if (family === 'CN') {
  const firstPlateAdded = await addFirstAvailablePhoto(
    plateIds,
    'Plaque constructeur châssis'
  );

  if (firstPlateAdded) {
    await addFirstAvailablePhoto(
      plateIds.filter(id => !usedPhotoIds.has(id)),
      'Plaque constructeur nacelle'
    );
  }
} else {
  await addFirstAvailablePhoto(
    plateIds,
    'Plaque constructeur'
  );
}
  if (figures.length) {
    return `
      <div class="report-cover-photos">
        ${figures.join('')}
      </div>
    `;
  }

  // Secours : ancien comportement si aucune photo obligatoire n'est disponible.
  const candidates = (visit.findings || []).flatMap(finding =>
    (finding.photos || [])
      .filter(photo => photo.includeInReport)
      .map(photo => ({ ...photo, finding }))
  );

  const selected =
    candidates.find(photo => photo.isMain) ||
    candidates[0];

  if (!selected) return '';

  try {
    const stored = await photoDbGet(selected.id);
    if (!stored?.blob) return '';

    const url = await blobToDataUrl(stored.blob);

    return `
      <figure class="report-cover-photo">
        <img src="${url}" alt="Machine contrôlée">
        <figcaption>Machine contrôlée</figcaption>
      </figure>
    `;
  } catch (error) {
    console.warn('Photo de couverture indisponible', error);
    return '';
  }
}

  async function buildReportPreview() {
    const visit = state.activeVisit;
    const machine = state.activeMachine;
    if (!visit || !machine) return toast('Aucune visite active.');
    saveDashboardReadings();
    saveControllerDetails();
    ensureTyreData(visit, machine);

    const findings = Array.isArray(visit.findings) ? visit.findings : [];
    const tyreItems = (visit.tyres?.axles || []).flatMap((axle, axleIndex) => axle.tyres.map(tyre => ({ ...tyre, axleIndex, label: tyrePositionLabel(axleIndex, tyre.side, tyre.position) })));
    const tyreWatch = tyreItems.filter(item => item.value === '25');
    const tyreHs = tyreItems.filter(item => item.value === 'HS' && !item.findingId);
    const carrier = zoneProgress(visit, 'carrier');
    const upper = zoneProgress(visit, 'upper');
    const totalPoints = carrier.total + upper.total;
    const remainingPoints = carrier.remaining + upper.remaining;
    const controlledPoints = totalPoints - remainingPoints;
    const conformPoints = Math.max(0, controlledPoints - findings.length - tyreHs.length);

    const carrierSections = visit.zones?.carrier?.sections || [];
    const upperSections = visit.zones?.upper?.sections || [];
    const sectionPages = [
      ...carrierSections.map((section, index) => ({ section, zoneTitle: 'Porteur', number: `02.${index + 1}` })),
      ...upperSections.map((section, index) => ({ section, zoneTitle: 'Tourelle', number: `03.${index + 1}` }))
    ];
    const finalPageCount = 1;
    const totalPages = 2 + sectionPages.length + findings.length + finalPageCount;
    const firstFindingPage = 3 + sectionPages.length;

    const coverPhoto = await reportCoverPhoto(visit);

    const cover = `
      <div class="report-cover-accent"></div>
      <p class="report-kicker">FOSELEV VFG</p>
      <p class="report-cover-system">Warranty Inspection System</p>
      <h2 class="report-cover-title">Rapport de visite de fin de garantie</h2>
      ${coverPhoto}
      <div class="report-machine-title">${escapeHtml(machine.parkNumber || machine.id || '—')}</div>
      <div class="report-machine-subtitle">${escapeHtml([machine.brand, machine.model || machine.designation].filter(Boolean).join(' · ') || 'Machine')}</div>
      <div class="report-cover-grid">
        <div><span>N° de série</span><strong>${escapeHtml(machine.serialNumber || '—')}</strong></div>
        <div><span>Agence</span><strong>${escapeHtml(machine.agency || '—')}</strong></div>
        <div><span>Date de la visite</span><strong>${escapeHtml(formatVisitDate(visit.visitDate))}</strong></div>
        <div><span>Kilométrage porteur</span><strong>${escapeHtml(formatMeter(visit.carrierKm, 'km'))}</strong></div>
        <div><span>Heures porteur</span><strong>${escapeHtml(formatMeter(visit.carrierHours, 'h'))}</strong></div>
        <div><span>Heures tourelle</span><strong>${escapeHtml(formatMeter(visit.upperHours, 'h'))}</strong></div>
        <div><span>Contrôleur</span><strong>${escapeHtml(visit.controllerName || '—')}</strong></div>
        <div><span>E-mail</span><strong>${escapeHtml(visit.controllerEmail || '—')}</strong></div>
        <div><span>Téléphone</span><strong>${escapeHtml(visit.controllerPhone || '—')}</strong></div>
      </div>
      <div class="report-cover-summary">
        <div><strong>${controlledPoints}</strong><span>points contrôlés</span></div>
        <div><strong>${conformPoints}</strong><span>conformes</span></div>
        <div><strong>${findings.length + tyreHs.length}</strong><span>non-conformités</span></div>
        <div><strong>${tyreWatch.length}</strong><span>à surveiller</span></div>
      </div>`;

    const summaryItems = [];
    findings.forEach((finding, index) => summaryItems.push({
      category: reportFindingCategory(finding.level),
      title: finding.pointLabel || finding.title || 'Point de contrôle',
      subtitle: [finding.sectionLabel, finding.zone === 'upper' ? 'Tourelle' : 'Porteur'].filter(Boolean).join(' · '),
      comment: finding.comment || 'Aucun commentaire.',
      page: firstFindingPage + index
    }));
    tyreHs.forEach(item => summaryItems.push({ category: 'nonconformity', title: item.label, subtitle: 'Porteur · Pneumatiques', comment: 'Pneumatique HS.', page: 3 + carrierSections.findIndex(s => s.id === 'tyres') }));
    tyreWatch.forEach(item => summaryItems.push({ category: 'watch', title: item.label, subtitle: 'Porteur · Pneumatiques', comment: 'Usure restante : 25 %.', page: 3 + carrierSections.findIndex(s => s.id === 'tyres') }));

  const categoryBlock = (category, title) => {
  const items = summaryItems.filter(
    item => item.category === category
  );

  return `
    <section class="report-summary-group">
      <h3>${title}</h3>

      ${
        items.length
          ? items.map((item, index) => `
              <div
  class="report-summary-item"
  id="report-summary-page-${item.page}"
>
                <span class="report-summary-index">
                  ${index + 1}
                </span>

                <div>
                  <strong>${escapeHtml(item.title)}</strong>
                  <small>${escapeHtml(item.subtitle)}</small>
                  <p>${escapeHtml(item.comment)}</p>
                </div>

                <a
                  class="report-summary-page-link"
                  href="#report-page-${item.page}"
                  title="Voir le détail page ${item.page}"
                >
                  Page ${item.page}
                </a>
              </div>
            `).join('')
          : '<p class="report-summary-empty">Aucun élément.</p>'
      }
    </section>
  `;
};
    const summary = `${reportSectionHeading('01', 'Synthèse')}
      ${categoryBlock('nonconformity', 'Non-conformités')}
      ${categoryBlock('watch', 'À surveiller')}
      ${categoryBlock('observation', 'Observations')}`;

    const innerPages = [cover, summary];
    sectionPages.forEach(item => innerPages.push(reportControlPage(item.section, item.zoneTitle, item.number, visit)));
    for (let index = 0; index < findings.length; index += 1) innerPages.push(await reportFindingPage(findings[index], index, firstFindingPage + index));
    innerPages.push(`${reportSectionHeading('04', 'Observations et signatures')}
      <section class="report-general-observations"><h3>Observations générales</h3><div class="report-writing-lines"></div></section>
      <div class="report-signatures"><section><h3>Contrôleur</h3><p>${escapeHtml(visit.controllerName || '')}</p><div class="report-signature-box"></div></section><section><h3>Représentant de l’agence / client</h3><p>Nom :</p><div class="report-signature-box"></div></section></div>`);

    $('#reportPreview').innerHTML = innerPages.map((inner, index) => reportPage(inner, index + 1, totalPages)).join('');
    $('#reportScreen .eyebrow').textContent = 'RAPPORT PDF · V4.0.0 S2-01';
    showScreen('report');
  }

  async function printReport() {
    if (!$('#reportPreview').children.length) await buildReportPreview();
    requestAnimationFrame(() => window.print());
  }

  function openPlaceholder(title, text) {
    $('#placeholderTitle').textContent = title;
    $('#placeholderText').textContent = text;
    showScreen('placeholder');
  }

  function toast(message) {
    const el = $('#toast');
    el.textContent = message;
    el.classList.remove('hidden');
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => el.classList.add('hidden'), 2600);
  }

  function refreshSearch() {
    const input = $('#machineSearch');
    const query = input.value.trim();
    $('#clearSearch').classList.toggle('hidden', !query);
    $('#resultsSection').classList.toggle('hidden', !query);
    if (!query) return renderMachineList($('#searchResults'), [], '');
    const results = searchMachines(query);
    $('#resultCount').textContent = results.length;
    renderMachineList($('#searchResults'), results, 'Aucune machine trouvée.');
  }



  function ensureFinishVisitUi() {
    if (!document.getElementById('vfg-finish-visit-style')) {
      const style = document.createElement('style');
      style.id = 'vfg-finish-visit-style';
      style.textContent = `
        #finishVisitDialog .point-dialog {
          width: min(94vw, 640px);
        }
        .finish-visit-summary {
          margin: 0 0 14px;
          color: #666;
        }
        .finish-visit-list {
          display: grid;
          gap: 8px;
          margin: 12px 0 18px;
          max-height: 50vh;
          overflow: auto;
        }
        .finish-visit-item {
          display: grid;
          grid-template-columns: 1fr auto;
          align-items: center;
          gap: 12px;
          width: 100%;
          padding: 12px 14px;
          border: 1px solid #ddd;
          border-radius: 12px;
          background: #fff;
          text-align: left;
          cursor: pointer;
          font: inherit;
        }
        .finish-visit-item strong,
        .finish-visit-item small {
          display: block;
        }
        .finish-visit-item small {
          margin-top: 3px;
          color: #777;
        }
        .finish-visit-count {
          min-width: 44px;
          height: 34px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 999px;
          background: #fff1e7;
          color: #d95700;
          font-weight: 900;
        }
        .finish-visit-actions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
        }
        .finish-visit-actions button {
          padding: 10px 16px;
          border-radius: 10px;
          font: inherit;
          font-weight: 800;
          cursor: pointer;
        }
        #finishVisitDialogClose {
          border: 1px solid #ccc;
          background: #fff;
        }
      `;
      document.head.appendChild(style);
    }

    if (!document.getElementById('finishVisitDialog')) {
      const dialog = document.createElement('div');
      dialog.id = 'finishVisitDialog';
      dialog.className = 'dialog-backdrop hidden';
      dialog.setAttribute('role', 'dialog');
      dialog.setAttribute('aria-modal', 'true');
      dialog.setAttribute('aria-hidden', 'true');

      dialog.innerHTML = `
        <div class="point-dialog">
          <button id="finishVisitDialogX" class="dialog-close" type="button" aria-label="Fermer">×</button>
          <h2>Visite incomplète</h2>
          <p id="finishVisitSummary" class="finish-visit-summary"></p>
          <div id="finishVisitList" class="finish-visit-list"></div>
          <div class="finish-visit-actions">
            <button id="finishVisitDialogClose" type="button">Fermer</button>
          </div>
        </div>
      `;

      document.body.appendChild(dialog);

      const close = () => {
        dialog.classList.add('hidden');
        dialog.setAttribute('aria-hidden', 'true');
      };

      $('#finishVisitDialogX').addEventListener('click', close);
      $('#finishVisitDialogClose').addEventListener('click', close);
      dialog.addEventListener('click', event => {
        if (event.target === dialog) close();
      });
    }
  }

  function ensureVisitScopeUi() {
    if (!document.getElementById('vfg-visit-scope-style')) {
      const style = document.createElement('style');
      style.id = 'vfg-visit-scope-style';
      style.textContent = `
        #visitScopeDialog .point-dialog {
          width: min(92vw, 560px);
        }
        .visit-scope-intro {
          margin: 4px 0 16px;
          color: #666;
        }
        .visit-scope-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 10px;
        }
        .visit-scope-choice {
          padding: 14px 16px;
          border: 1px solid #d5d5d5;
          border-radius: 14px;
          background: #fff;
          text-align: left;
          cursor: pointer;
          font: inherit;
        }
        .visit-scope-choice strong,
        .visit-scope-choice span {
          display: block;
        }
        .visit-scope-choice strong {
          font-size: 15px;
        }
        .visit-scope-choice span {
          margin-top: 4px;
          color: #777;
          font-size: 12px;
        }
        .visit-scope-choice:hover,
        .visit-scope-choice:focus {
          border-color: #ff6a00;
          outline: none;
        }
        .visit-scope-summary {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 10px 0 16px;
          padding: 11px 14px;
          border: 1px solid #e0e0e0;
          border-radius: 12px;
          background: #fafafa;
          color: #555;
          font-size: 13px;
        }
        .visit-scope-summary strong {
          color: #222;
        }
        .visit-scope-summary button {
          margin-left: auto;
          border: 1px solid #ccc;
          border-radius: 999px;
          background: #fff;
          padding: 6px 10px;
          font: inherit;
          font-size: 12px;
          font-weight: 800;
          cursor: pointer;
        }
        .dashboard-card.is-zone-disabled {
          opacity: .48;
        }
        .dashboard-card.is-zone-disabled .dashboard-main {
          cursor: not-allowed;
        }
        .dashboard-card.is-zone-disabled .dashboard-copy strong {
          font-size: 30px;
        }
        .dashboard-card.is-zone-complete:not(.is-zone-disabled) {
          border-width: 2px;
        }
        .dashboard-card.is-zone-complete:not(.is-zone-disabled) .dashboard-copy strong {
          font-size: 20px;
          font-weight: 900;
        }
      `;
      document.head.appendChild(style);
    }

    if (!document.getElementById('visitScopeDialog')) {
      const dialog = document.createElement('div');
      dialog.id = 'visitScopeDialog';
      dialog.className = 'dialog-backdrop hidden';
      dialog.setAttribute('role', 'dialog');
      dialog.setAttribute('aria-modal', 'true');
      dialog.setAttribute('aria-hidden', 'true');

      dialog.innerHTML = `
        <div class="point-dialog">
          <button id="visitScopeClose" class="dialog-close" type="button" aria-label="Fermer">×</button>
          <h2>Périmètre de la visite</h2>
          <p id="visitScopeText" class="visit-scope-intro"></p>

          <div class="visit-scope-grid">
            <button class="visit-scope-choice" type="button" data-visit-scope="both">
              <strong id="visitScopeBothTitle">Châssis + Équipement</strong>
              <span>Contrôler les deux parties de la machine</span>
            </button>

            <button class="visit-scope-choice" type="button" data-visit-scope="carrier">
              <strong id="visitScopeCarrierTitle">Châssis uniquement</strong>
              <span>Ne pas inclure l’équipement dans cette visite</span>
            </button>

            <button class="visit-scope-choice" type="button" data-visit-scope="upper">
              <strong id="visitScopeUpperTitle">Équipement uniquement</strong>
              <span>Ne pas inclure le châssis dans cette visite</span>
            </button>
          </div>
        </div>
      `;

      document.body.appendChild(dialog);
    }
  }

  let visitScopeResolver = null;

  function closeVisitScopeDialog(result = null) {
    const dialog = $('#visitScopeDialog');
    if (dialog) {
      dialog.classList.add('hidden');
      dialog.setAttribute('aria-hidden', 'true');
    }

    const resolver = visitScopeResolver;
    visitScopeResolver = null;
    if (resolver) resolver(result);
  }

  function askVisitScope(machine, visit, { allowCancel = true } = {}) {
    ensureVisitScopeUi();

    const family = machineFamily(machine, visit);
    if (!['CB', 'CN'].includes(family)) {
      ensureVisitScope(visit, machine);
      return Promise.resolve({ ...visit.scope });
    }

    const carrierLabel = zoneDisplayLabel(machine, 'carrier', visit);
    const upperLabel = zoneDisplayLabel(machine, 'upper', visit);

    $('#visitScopeText').textContent =
      `${machine.parkNumber || machine.id} · choisissez les parties à contrôler.`;

    $('#visitScopeBothTitle').textContent = `${carrierLabel} + ${upperLabel}`;
    $('#visitScopeCarrierTitle').textContent = `${carrierLabel} uniquement`;
    $('#visitScopeUpperTitle').textContent = `${upperLabel} uniquement`;

    const dialog = $('#visitScopeDialog');
    dialog.classList.remove('hidden');
    dialog.setAttribute('aria-hidden', 'false');

    return new Promise(resolve => {
      visitScopeResolver = resolve;

      dialog.querySelectorAll('[data-visit-scope]').forEach(button => {
        button.onclick = () => {
          const value = button.dataset.visitScope;
          closeVisitScopeDialog({
            carrier: value === 'both' || value === 'carrier',
            upper: value === 'both' || value === 'upper'
          });
        };
      });

      $('#visitScopeClose').onclick = () => {
        if (allowCancel) closeVisitScopeDialog(null);
      };

      dialog.onclick = event => {
        if (event.target === dialog && allowCancel) closeVisitScopeDialog(null);
      };
    });
  }

  async function createVisitWithScope(machine) {
    const visit = createVisit(machine);
    const family = machineFamily(machine, visit);

    if (family === 'CB' || family === 'CN') {
      const scope = await askVisitScope(machine, visit);
      if (!scope) return null;
      visit.scope = scope;
    } else {
      visit.scope = { carrier: true, upper: true };
    }

    return visit;
  }

  async function modifyActiveVisitScope() {
    const visit = state.activeVisit;
    const machine = state.activeMachine;

    if (!visit || !machine) return;

    const family = machineFamily(machine, visit);
    if (!['CB', 'CN'].includes(family)) {
      toast('Le châssis et l’équipement sont obligatoires pour cette famille de machine.');
      return;
    }

    if (visitHasStarted(visit)) {
      toast('Le périmètre est verrouillé : au moins un point a déjà été traité.');
      return;
    }

    const scope = await askVisitScope(machine, visit);
    if (!scope) return;

    visit.scope = scope;
    if (!markVisitDraft()) return;
    saveActiveVisit();
    renderDashboard();

    toast(`Périmètre : ${visitScopeLabel(machine, visit)}.`);
  }


  function ensureSupplementaryDashboardUi() {
    if ($('#supplementaryDashboardStatus')) return;

    const status = document.createElement('div');
    status.id = 'supplementaryDashboardStatus';
    status.style.marginTop = '6px';
    status.style.fontSize = '12px';
    status.style.fontWeight = '800';
    status.style.opacity = '.78';

    $('#visitScopeSummary')?.insertAdjacentElement('afterend', status);
  }

  function renderSupplementaryDashboardStatus() {
    ensureSupplementaryDashboardUi();

    const node = $('#supplementaryDashboardStatus');
    if (!node || !state.activeVisit) return;

    const standard = standardVisitProgressSummary(state.activeVisit);
    const extra = supplementaryProgress(state.activeVisit);
    const total = visitProgressSummary(state.activeVisit);

    if (extra.total === 0) {
      node.textContent =
        `Points de contrôle : ${standard.total} référentiel · Total visite : ${total.total}`;
      return;
    }

    node.textContent =
      `Points de contrôle : ${standard.total} référentiel + ${extra.total} ajouté(s) = ${total.total} total` +
      (extra.remaining > 0
        ? ` · ${extra.remaining} contrôle(s) ajouté(s) restant(s)`
        : ' · contrôles ajoutés traités ✓');
  }

  function refreshVisitScopeSummary() {
    const dashboard = $('#dashboardScreen');
    if (!dashboard || !state.activeVisit || !state.activeMachine) return;

    let summary = $('#visitScopeSummary');
    if (!summary) {
      summary = document.createElement('div');
      summary.id = 'visitScopeSummary';
      summary.className = 'visit-scope-summary';

      const controllerBlock = dashboard.querySelector('.controller-inline');
      if (controllerBlock) controllerBlock.insertAdjacentElement('afterend', summary);
      else $('#dashboardSubtitle')?.insertAdjacentElement('afterend', summary);
    }

    const family = machineFamily(state.activeMachine, state.activeVisit);
    const editable = ['CB', 'CN'].includes(family) && !visitHasStarted(state.activeVisit);

    const progress = visitProgressSummary(state.activeVisit);

    const statusLabel = state.activeVisit.status || 'Brouillon';
    const craneInfo = craneFamilyApplicable(state.activeMachine, state.activeVisit)
      ? ` · Référentiel : <strong>${escapeHtml(craneFamilyLabel())}</strong>${craneFamilyIsLocked() ? ' 🔒' : ''}`
      : '';
summary.innerHTML = `
  <span>
    Périmètre : <strong>${escapeHtml(visitScopeLabel())}</strong>
    · Avancement : <strong>${progress.controlled}/${progress.total}</strong>
    · Statut : <strong>${escapeHtml(statusLabel)}</strong>
    ${craneInfo}
  </span>
  ${editable ? '<button id="editVisitScope" type="button">Modifier</button>' : ''}
`;

$('#editVisitScope')?.addEventListener('click', modifyActiveVisitScope);
  }

  function ensureCbEquipmentUi() {
    if (!document.getElementById('vfg-cb-equipment-style')) {
      const style = document.createElement('style');
      style.id = 'vfg-cb-equipment-style';
      style.textContent = `
        .cb-equipment-card {
          margin: 14px 0;
          padding: 16px;
          border: 1px solid #dedede;
          border-radius: 16px;
          background: #fff;
        }
        .cb-equipment-card.hidden {
          display: none;
        }
        .cb-equipment-heading {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 12px;
        }
        .cb-equipment-heading h2 {
          margin: 0;
          font-size: 17px;
        }
        .cb-equipment-heading small {
          color: #777;
          font-weight: 700;
        }
        .cb-equipment-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 12px;
        }
        .cb-equipment-grid label {
          display: grid;
          gap: 6px;
          font-size: 12px;
          font-weight: 800;
          color: #555;
        }
        .cb-equipment-grid input {
          width: 100%;
          box-sizing: border-box;
          border: 1px solid #d4d4d4;
          border-radius: 10px;
          padding: 10px 11px;
          font: inherit;
          background: #fff;
        }
        .cb-equipment-grid input.is-missing {
          border-color: #ff6a00;
          background: #fff8f2;
        }
        .cb-equipment-status {
          margin-top: 10px;
          font-size: 12px;
          font-weight: 800;
        }
        .cb-equipment-status.is-ok {
          color: #287b3a;
        }
        .cb-equipment-status.is-missing {
          color: #d95700;
        }
        @media (max-width: 760px) {
          .cb-equipment-grid {
            grid-template-columns: 1fr;
          }
        }
      `;
      document.head.appendChild(style);
    }

    if ($('#cbEquipmentCard')) return;

    const card = document.createElement('section');
    card.id = 'cbEquipmentCard';
    card.className = 'cb-equipment-card hidden';
    card.innerHTML = `
      <div class="cb-equipment-heading">
        <h2>Identification du bras de grue</h2>
        <small>Obligatoire pour le contrôle du bras</small>
      </div>

      <div class="cb-equipment-grid">
        <label>
          Marque du bras
          <input id="cbEquipmentBrand" type="text" list="cbEquipmentBrands" autocomplete="off" placeholder="Ex. Fassi">
        </label>

        <label>
          Type du bras
          <input id="cbEquipmentType" type="text" autocomplete="off" placeholder="Référence / modèle">
        </label>

        <label>
          N° de série du bras
          <input id="cbEquipmentSerial" type="text" autocomplete="off" placeholder="Numéro de série">
        </label>
      </div>

      <datalist id="cbEquipmentBrands">
        <option value="Fassi"></option>
        <option value="HIAB"></option>
        <option value="Palfinger"></option>
        <option value="Effer"></option>
        <option value="PM"></option>
        <option value="HMF"></option>
        <option value="Copma"></option>
        <option value="Bonfiglioli"></option>
        <option value="Atlas"></option>
        <option value="Pesci"></option>
        <option value="Marrel"></option>
      </datalist>

      <div id="cbEquipmentStatus" class="cb-equipment-status"></div>
    `;

    const controllerBlock = $('#dashboardScreen .controller-inline');
    if (controllerBlock) {
      controllerBlock.insertAdjacentElement('beforebegin', card);
    } else {
      $('#dashboardSubtitle')?.insertAdjacentElement('afterend', card);
    }

    for (const inputId of [
      'cbEquipmentBrand',
      'cbEquipmentType',
      'cbEquipmentSerial'
    ]) {
      const input = $(`#${inputId}`);

      input.addEventListener('change', saveCbEquipmentIdentity);
      input.addEventListener('blur', saveCbEquipmentIdentity);
      input.addEventListener('keydown', event => {
        if (event.key !== 'Enter') return;
        event.preventDefault();
        saveCbEquipmentIdentity();

        const sequence = [
          $('#cbEquipmentBrand'),
          $('#cbEquipmentType'),
          $('#cbEquipmentSerial')
        ];

        const index = sequence.indexOf(input);
        const next = sequence[index + 1];

        if (next) next.focus();
        else input.blur();
      });
    }
  }

  function saveCbEquipmentIdentity() {
    const visit = state.activeVisit;
    if (!visit || !cbEquipmentRequired()) return;
    if (['Terminée', 'Synchronisée'].includes(visit.status)) return;
    if (!markVisitDraft()) return;

    if (!visit.cbEquipment || typeof visit.cbEquipment !== 'object') {
      visit.cbEquipment = {};
    }

    visit.cbEquipment.brand = $('#cbEquipmentBrand').value.trim();
    visit.cbEquipment.type = $('#cbEquipmentType').value.trim();
    visit.cbEquipment.serialNumber = $('#cbEquipmentSerial').value.trim();

    saveActiveVisit();
    renderCbEquipmentIdentity();
  }

  function renderCbEquipmentIdentity() {
    ensureCbEquipmentUi();

    const visit = state.activeVisit;
    const card = $('#cbEquipmentCard');

    if (!visit || !card) return;

    const required = cbEquipmentRequired();
    card.classList.toggle('hidden', !required);

    if (!required) return;

    const equipment = visit.cbEquipment || {};

    $('#cbEquipmentBrand').value = equipment.brand || '';
    $('#cbEquipmentType').value = equipment.type || '';
    $('#cbEquipmentSerial').value = equipment.serialNumber || '';

    const locked = ['Terminée', 'Synchronisée'].includes(visit.status);

    $('#cbEquipmentBrand').disabled = locked;
    $('#cbEquipmentType').disabled = locked;
    $('#cbEquipmentSerial').disabled = locked;

    const missing = cbEquipmentMissingFields(visit);
    const fieldMap = {
      brand: $('#cbEquipmentBrand'),
      type: $('#cbEquipmentType'),
      serialNumber: $('#cbEquipmentSerial')
    };

    Object.entries(fieldMap).forEach(([field, input]) => {
      input?.classList.toggle('is-missing', missing.includes(field));
    });

    const status = $('#cbEquipmentStatus');

    if (missing.length === 0) {
      status.textContent = '✓ Identification du bras complète';
      status.className = 'cb-equipment-status is-ok';
    } else {
      status.textContent = `À compléter : ${cbEquipmentMissingLabel(missing)}`;
      status.className = 'cb-equipment-status is-missing';
    }
  }

  function focusFirstMissingCbEquipmentField() {
    renderDashboard();
    showScreen('dashboard');

    const missing = cbEquipmentMissingFields();
    const fieldMap = {
      brand: '#cbEquipmentBrand',
      type: '#cbEquipmentType',
      serialNumber: '#cbEquipmentSerial'
    };

    const selector = fieldMap[missing[0]];
    if (!selector) return;

    setTimeout(() => {
      const input = $(selector);
      input?.focus();
      input?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 0);
  }


  function ensureCnEquipmentUi() {
    if ($('#cnEquipmentCard')) return;

    const card = document.createElement('section');
    card.id = 'cnEquipmentCard';
    card.className = 'cb-equipment-card hidden';
    card.innerHTML = `
      <div class="cb-equipment-heading">
        <h2>Identification de la nacelle</h2>
        <small>Obligatoire pour le contrôle de la nacelle</small>
      </div>

      <div class="cb-equipment-grid">
        <label>
          Marque de la nacelle
          <input id="cnEquipmentBrand" type="text" autocomplete="off" placeholder="Marque">
        </label>

        <label>
          Type de la nacelle
          <input id="cnEquipmentType" type="text" autocomplete="off" placeholder="Référence / modèle">
        </label>

        <label>
          N° de série de la nacelle
          <input id="cnEquipmentSerial" type="text" autocomplete="off" placeholder="Numéro de série">
        </label>
      </div>

      <div id="cnEquipmentStatus" class="cb-equipment-status"></div>
    `;

    const cbCard = $('#cbEquipmentCard');
    if (cbCard) {
      cbCard.insertAdjacentElement('afterend', card);
    } else {
      const controllerBlock = $('#dashboardScreen .controller-inline');
      if (controllerBlock) controllerBlock.insertAdjacentElement('beforebegin', card);
      else $('#dashboardSubtitle')?.insertAdjacentElement('afterend', card);
    }

    for (const inputId of [
      'cnEquipmentBrand',
      'cnEquipmentType',
      'cnEquipmentSerial'
    ]) {
      const input = $(`#${inputId}`);

      input.addEventListener('change', saveCnEquipmentIdentity);
      input.addEventListener('blur', saveCnEquipmentIdentity);
      input.addEventListener('keydown', event => {
        if (event.key !== 'Enter') return;
        event.preventDefault();
        saveCnEquipmentIdentity();

        const sequence = [
          $('#cnEquipmentBrand'),
          $('#cnEquipmentType'),
          $('#cnEquipmentSerial')
        ];

        const index = sequence.indexOf(input);
        const next = sequence[index + 1];

        if (next) next.focus();
        else input.blur();
      });
    }
  }

  function saveCnEquipmentIdentity() {
    const visit = state.activeVisit;
    if (!visit || !cnEquipmentRequired()) return;
    if (['Terminée', 'Synchronisée'].includes(visit.status)) return;
    if (!markVisitDraft()) return;

    if (!visit.cnEquipment || typeof visit.cnEquipment !== 'object') {
      visit.cnEquipment = {};
    }

    visit.cnEquipment.brand = $('#cnEquipmentBrand').value.trim();
    visit.cnEquipment.type = $('#cnEquipmentType').value.trim();
    visit.cnEquipment.serialNumber = $('#cnEquipmentSerial').value.trim();

    saveActiveVisit();
    renderCnEquipmentIdentity();
  }

  function renderCnEquipmentIdentity() {
    ensureCnEquipmentUi();

    const visit = state.activeVisit;
    const card = $('#cnEquipmentCard');

    if (!visit || !card) return;

    const required = cnEquipmentRequired();
    card.classList.toggle('hidden', !required);

    if (!required) return;

    const equipment = visit.cnEquipment || {};

    $('#cnEquipmentBrand').value = equipment.brand || '';
    $('#cnEquipmentType').value = equipment.type || '';
    $('#cnEquipmentSerial').value = equipment.serialNumber || '';

    const locked = ['Terminée', 'Synchronisée'].includes(visit.status);

    $('#cnEquipmentBrand').disabled = locked;
    $('#cnEquipmentType').disabled = locked;
    $('#cnEquipmentSerial').disabled = locked;

    const missing = cnEquipmentMissingFields(visit);
    const fieldMap = {
      brand: $('#cnEquipmentBrand'),
      type: $('#cnEquipmentType'),
      serialNumber: $('#cnEquipmentSerial')
    };

    Object.entries(fieldMap).forEach(([field, input]) => {
      input?.classList.toggle('is-missing', missing.includes(field));
    });

    const status = $('#cnEquipmentStatus');

    if (missing.length === 0) {
      status.textContent = '✓ Identification de la nacelle complète';
      status.className = 'cb-equipment-status is-ok';
    } else {
      status.textContent = `À compléter : ${cnEquipmentMissingLabel(missing)}`;
      status.className = 'cb-equipment-status is-missing';
    }
  }

  function focusFirstMissingCnEquipmentField() {
    renderDashboard();
    showScreen('dashboard');

    const missing = cnEquipmentMissingFields();
    const fieldMap = {
      brand: '#cnEquipmentBrand',
      type: '#cnEquipmentType',
      serialNumber: '#cnEquipmentSerial'
    };

    const selector = fieldMap[missing[0]];
    if (!selector) return;

    setTimeout(() => {
      const input = $(selector);
      input?.focus();
      input?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 0);
  }


  function ensureOptionalEquipmentUi() {
    if (!document.getElementById('vfg-optional-equipment-style')) {
      const style = document.createElement('style');
      style.id = 'vfg-optional-equipment-style';
      style.textContent = `
        .optional-equipment-card {
          margin: 12px 0 16px;
          padding: 14px;
          border: 1px solid #d7d7d7;
          border-radius: 14px;
          background: #fff;
        }
        .optional-equipment-card.hidden {
          display: none;
        }
        .optional-equipment-card.is-present {
          border-width: 2px;
        }
        .optional-equipment-copy {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 10px;
        }
        .optional-equipment-copy strong {
          font-size: 14px;
        }
        .optional-equipment-copy span {
          font-size: 12px;
          font-weight: 900;
        }
        .optional-equipment-card button {
          width: 100%;
          border: 1px solid #cfcfcf;
          border-radius: 11px;
          padding: 11px 12px;
          font: inherit;
          font-weight: 900;
          cursor: pointer;
          background: #fff;
        }
        .point-option-badge.is-present {
          font-weight: 900;
        }
        .point-option-badge.is-absent {
          opacity: .72;
        }
      `;
      document.head.appendChild(style);
    }

    if ($('#optionalEquipmentCard')) return;

    const card = document.createElement('div');
    card.id = 'optionalEquipmentCard';
    card.className = 'optional-equipment-card hidden';
    card.innerHTML = `
      <div class="optional-equipment-copy">
        <strong>Équipement facultatif</strong>
        <span id="optionalEquipmentState"></span>
      </div>
      <button id="toggleOptionalEquipment" type="button"></button>
    `;

    $('#inspectionSubtitle')?.insertAdjacentElement('afterend', card);

    $('#toggleOptionalEquipment')?.addEventListener(
      'click',
      toggleOptionalEquipmentPresence
    );
  }

  function renderOptionalEquipmentPanel(section = currentSection()) {
    ensureOptionalEquipmentUi();

    const card = $('#optionalEquipmentCard');
    if (!card) return;

    const optionalSection = isOptionalEquipmentSection(section);
    card.classList.toggle('hidden', !optionalSection);

    if (!optionalSection) return;

    const present = section.optionPresent === true;
    card.classList.toggle('is-present', present);

    $('#optionalEquipmentState').textContent =
      present ? 'PRÉSENTE' : 'ABSENTE · N/A';

    $('#toggleOptionalEquipment').textContent =
      present
        ? 'Déclarer cette option absente (N/A)'
        : 'Activer cette option / équipement';
  }


  function ensureSupplementaryControlsUi() {
    if (!document.getElementById('vfg-supplementary-style')) {
      const style = document.createElement('style');
      style.id = 'vfg-supplementary-style';
      style.textContent = `
        .supplementary-zone-card {
          margin-top: 14px;
          border: 1px dashed #a9a9a9;
          border-radius: 14px;
          padding: 14px;
          background: #fff;
        }
        .supplementary-zone-card.is-pending {
          border-width: 2px;
        }
        .supplementary-zone-card button {
          width: 100%;
          border: 0;
          background: transparent;
          padding: 0;
          text-align: left;
          cursor: pointer;
          font: inherit;
        }
        .supplementary-zone-copy {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }
        .supplementary-zone-copy strong {
          display: block;
          font-size: 15px;
        }
        .supplementary-zone-copy small {
          display: block;
          margin-top: 4px;
          opacity: .72;
        }
        .supplementary-zone-count {
          font-weight: 900;
          white-space: nowrap;
        }
        .supplementary-editor {
          margin: 12px 0 16px;
          padding: 14px;
          border: 1px dashed #aaa;
          border-radius: 14px;
          background: #fff;
        }
        .supplementary-editor.hidden {
          display: none;
        }
        .supplementary-editor strong {
          display: block;
          margin-bottom: 4px;
        }
        .supplementary-editor small {
          display: block;
          margin-bottom: 10px;
          opacity: .72;
        }
        .supplementary-editor-row {
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 8px;
        }
        .supplementary-editor-row input {
          min-width: 0;
          border: 1px solid #d2d2d2;
          border-radius: 10px;
          padding: 10px 11px;
          font: inherit;
        }
        .supplementary-editor-row button {
          border: 1px solid #cfcfcf;
          border-radius: 10px;
          padding: 10px 13px;
          background: #fff;
          font: inherit;
          font-weight: 900;
          cursor: pointer;
        }
        .supplementary-point-tools {
          display: inline-flex;
          gap: 5px;
          margin-left: 5px;
        }
        .supplementary-point-tools button {
          border: 1px solid #ddd;
          border-radius: 8px;
          background: #fff;
          padding: 6px 8px;
          cursor: pointer;
        }
        .supplementary-point-tools .supplementary-finding-button {
          padding: 7px 10px;
          font-weight: 900;
          white-space: nowrap;
        }
        .supplementary-point-tools .supplementary-finding-button.has-finding {
          border-width: 2px;
        }
        @media (max-width: 650px) {
          .supplementary-editor-row {
            grid-template-columns: 1fr;
          }
        }
      `;
      document.head.appendChild(style);
    }

    if (!$('#supplementaryEditor')) {
      const editor = document.createElement('div');
      editor.id = 'supplementaryEditor';
      editor.className = 'supplementary-editor hidden';
      editor.innerHTML = `
        <strong>Contrôle libre hors référentiel</strong>
        <small>
          Ces contrôles sont ajoutés au total de la visite sans modifier
          le nombre de points du référentiel de base. Chaque point peut être
          déclaré Conforme, Constat, N/A ou NE.
        </small>
        <div class="supplementary-editor-row">
          <input
            id="supplementaryControlInput"
            type="text"
            autocomplete="off"
            placeholder="Ex. Vérifier état du support spécifique"
          >
          <button id="addSupplementaryControl" type="button">
            + Ajouter
          </button>
        </div>
      `;

      $('#inspectionSubtitle')?.insertAdjacentElement('afterend', editor);

      $('#addSupplementaryControl')?.addEventListener(
        'click',
        () => addSupplementaryControl(state.activeZone)
      );

      $('#supplementaryControlInput')?.addEventListener('keydown', event => {
        if (event.key !== 'Enter') return;
        event.preventDefault();
        addSupplementaryControl(state.activeZone);
      });
    }
  }

  function renderSupplementaryEditor(section = currentSection()) {
    ensureSupplementaryControlsUi();

    const editor = $('#supplementaryEditor');
    if (!editor) return;

    const visible = isSupplementarySection(section);
    editor.classList.toggle('hidden', !visible);

    if (!visible) return;

    const input = $('#supplementaryControlInput');

    if (input) {
      input.disabled = ['Terminée', 'Synchronisée']
        .includes(state.activeVisit?.status);
    }
  }

  function renderSupplementaryZoneCard(zone = state.activeZone) {
    const list = $('#sectionList');
    if (!list || !state.activeVisit || !zone) return;

    const section = supplementarySection(zone);
    const progress = sectionProgress(section);
    const query = normalize($('#sectionSearch')?.value || '');

    const matchesSearch =
      !query ||
      normalize(section.label).includes(query) ||
      section.points.some(point => normalize(point.label).includes(query));

    if (!matchesSearch) return;

    const wrapper = document.createElement('div');
    wrapper.className =
      `supplementary-zone-card${progress.remaining > 0 ? ' is-pending' : ''}`;

    let detail = 'Aucun contrôle ajouté';

    if (section.points.length > 0) {
      detail = progress.remaining > 0
        ? `${progress.remaining} à traiter · ${section.points.length} ajouté(s) au total visite`
        : `✓ ${section.points.length} contrôle(s) ajouté(s) traité(s)`;
    }

    wrapper.innerHTML = `
      <button type="button" data-open-supplementary="${escapeHtml(zone)}">
        <span class="supplementary-zone-copy">
          <span>
            <strong>➕ Contrôle supplémentaire</strong>
            <small>${escapeHtml(detail)}</small>
          </span>
          <span class="supplementary-zone-count">
            ${section.points.length > 0 ? `${progress.remaining}/${progress.total}` : '+'}
          </span>
        </span>
      </button>
    `;

    wrapper.querySelector('[data-open-supplementary]')
      ?.addEventListener('click', () => openSupplementaryControls(zone));

    list.appendChild(wrapper);
  }

  function ensurePoint1Styles() {
    if (document.getElementById('vfg-point1-styles')) return;

    const style = document.createElement('style');
    style.id = 'vfg-point1-styles';
    style.textContent = `
      .inspection-point.is-na { opacity: .72; }
      .inspection-point.is-na .point-status-button {
        min-width: 48px;
        width: auto;
        padding: 0 7px;
        border-radius: 999px;
      }
      .inspection-point.is-na .point-status {
        font-size: 11px;
        font-weight: 800;
        white-space: nowrap;
      }
      .point-option-badge {
        display: inline-block;
        margin-left: 7px;
        padding: 2px 6px;
        border-radius: 999px;
        font-size: 10px;
        font-weight: 800;
        line-height: 1.2;
        opacity: .72;
        vertical-align: middle;
      }
    `;
    document.head.appendChild(style);
  }

  function bindEvents() {
    const input = $('#machineSearch');
    input.addEventListener('input', refreshSearch);
    $('#clearSearch').addEventListener('click', () => {
      input.value = '';
      refreshSearch();
      input.focus();
    });
    $('#clearRecents').addEventListener('click', () => {
      clearRecents();
      renderCompactRecentMachines();
    });
    $('#backButton').addEventListener('click', () => {
      if (state.activeScreen === 'visitInit') {
        if (state.initReturnScreen === 'dashboard' && hasVisitReadings(state.activeVisit)) {
          renderDashboard();
          showScreen('dashboard');
        } else {
          showScreen('search');
        }
      } else if (state.activeScreen === 'findingForm') {
        cancelFindingForm();
      } else if (state.activeScreen === 'inspection' || state.activeScreen === 'tyres') {
        renderZone(state.activeZone);
      } else if (state.activeScreen === 'placeholder') {
        if (state.activeZone) renderZone(state.activeZone);
        else showScreen('dashboard');
      } else if (state.activeScreen === 'findings') {
        if (state.activeZone) renderZone(state.activeZone);
        else showScreen('dashboard');
      } else if (state.activeScreen === 'zone') {
        showScreen('dashboard');
      } else if (state.activeScreen === 'report') {
        renderDashboard();
        showScreen('dashboard');
      } else if (state.activeScreen === 'dashboard') {
        showScreen('search');
      } else {
        showScreen('search');
      }
    });
    $('#helpButton').addEventListener('click', () => toast('Recherchez par n° de parc, série, modèle, constructeur ou agence.'));

    document.querySelectorAll('[data-open-zone]').forEach(button => button.addEventListener('click', () => {
      renderZone(button.dataset.openZone);
    }));

    document.querySelectorAll('[data-open-nc]').forEach(button => button.addEventListener('click', () => {
      openFindings(button.dataset.openNc);
    }));

    $('#sectionSearch').addEventListener('input', renderSectionList);
    $('#showZoneNc').addEventListener('click', () => openFindings(state.activeZone));

    document.querySelectorAll('[data-go-dashboard]').forEach(button => button.addEventListener('click', () => showScreen('dashboard')));
    const cancelVisitInit = $('#cancelVisitInit');
    if (cancelVisitInit) cancelVisitInit.addEventListener('click', () => {
      if (state.initReturnScreen === 'dashboard' && hasVisitReadings(state.activeVisit)) {
        renderDashboard();
        showScreen('dashboard');
      } else {
        showScreen('search');
      }
    });
    $('#dashboardMkMode').addEventListener('change', event => {
  const visit = state.activeVisit;
  const machine = state.activeMachine;

  if (!visit || !machine) return;

  const isGm = String(machine.category || '').toUpperCase() === 'GM';

  if (!isGm) {
    event.target.checked = machineFamily(machine, visit) === 'MK';
    return;
  }

  if (craneFamilyIsLocked(machine, visit) || visitHasStarted(visit)) {
    event.target.checked = machineFamily(machine, visit) === 'MK';

    toast(
      `Le référentiel ${craneFamilyLabel(machine, visit)} est verrouillé après le début du contrôle.`
    );

    return;
  }

  const mkMode = event.target.checked;
  const selectedFamily = mkMode ? 'MK' : 'GM';

  visit.mkMode = mkMode;
  visit.craneFamily = selectedFamily;
  visit.craneFamilyLocked = false;
  visit.craneFamilyLockedAt = null;
  visit.referentialVersion = REFERENTIAL_VERSION;
  visit.family = selectedFamily;
  visit.scope = { carrier: true, upper: true };

  // Aucun point n'est encore traité : reconstruction sans perte de données métier.
  visit.zones = {
    carrier: {
      sections: createSections('carrier', machine, visit)
    },
    upper: {
      sections: createSections('upper', machine, visit)
    }
  };

  ensureTyreData(visit, machine);

  saveActiveVisit();
  renderDashboard();

  toast(
    selectedFamily === 'MK'
      ? 'Référentiel sélectionné : MK.'
      : 'Référentiel sélectionné : GM classique.'
  );
});
    $('#newVisit').addEventListener('click', async () => {
      if (confirm('Créer une nouvelle visite pour cette machine ? La visite actuelle restera enregistrée.')) {
        await startNewVisit();
      }
    });
    $('#previewReport').addEventListener('click', buildReportPreview);
    $('#closeReport').addEventListener('click', () => { renderDashboard(); showScreen('dashboard'); });
    $('#printReport').addEventListener('click', printReport);
    $('#finishVisit').addEventListener('click', finishActiveVisit);


    $('#axleCountSelector').addEventListener('click', event => {
      const button = event.target.closest('[data-axle-count]');
      if (button) setAxleCount(Number(button.dataset.axleCount));
    });
    $('#tyreDiagram').addEventListener('click', event => {
      const axle = event.target.closest('[data-toggle-axle]');
      const tyre = event.target.closest('[data-tyre-id]');
      if (axle) toggleAxleMode(Number(axle.dataset.toggleAxle));
      else if (tyre) openTyreContextMenu(tyre.dataset.tyreId, tyre);
    });
    $('#resetTyres').addEventListener('click', resetTyres);
    $('#tyreStateOptions').addEventListener('click', event => {
      const button = event.target.closest('[data-tyre-value]');
      if (button) setTyreValue(button.dataset.tyreValue);
    });
    $('#tyreDialogClose').addEventListener('click', closeTyreStateDialog);
    $('#tyreCreateFinding').addEventListener('click', createTyreFinding);
    $('#tyreStateDialog').addEventListener('click', event => { if (event.target.id === 'tyreStateDialog') closeTyreStateDialog(); });
    $('#tyreContextOptions').addEventListener('click', event => {
      const button = event.target.closest('[data-tyre-context-value]');
      if (button) setTyreValue(button.dataset.tyreContextValue);
    });
    $('#tyreContextFinding').addEventListener('click', createTyreFinding);
    document.addEventListener('pointerdown', event => {
      const menu = $('#tyreContextMenu');
      if (!menu || menu.classList.contains('hidden')) return;
      if (!menu.contains(event.target) && !event.target.closest('[data-tyre-id]')) closeTyreContextMenu();
    });
    document.addEventListener('keydown', event => { if (event.key === 'Escape') closeTyreContextMenu(); });
    window.addEventListener('resize', closeTyreContextMenu);
    window.addEventListener('scroll', closeTyreContextMenu, true);
    $('#validateSection').addEventListener('click', validateWholeSection);
    $('#pointActionClose').addEventListener('click', closePointActions);
    $('#pointActionConform').addEventListener(
      'click',
      () => setPointConform(state.activePointId)
    );

    $('#pointActionFinding').addEventListener(
      'click',
      () => openFindingForm()
    );
    $('#findingCancel').addEventListener('click', cancelFindingForm);
    $('#findingSave').addEventListener('click', saveFinding);
    $('#findingDelete').addEventListener('click', deleteFinding);
  $('#takePhotoButton').addEventListener(
  'click',
  () => $('#cameraPhotoInput').click()
);

$('#galleryPhotoButton').addEventListener(
  'click',
  () => $('#galleryPhotoInput').click()
);

$('#visitPhotoLibraryButton').addEventListener(
  'click',
  openVisitPhotoLibrary
);
$('#visitPhotoLibraryImport').addEventListener(
  'click',
  () => $('#visitPhotoLibraryInput').click()
);

$('#visitPhotoLibraryInput').addEventListener(
  'change',
  event => importPhotosToVisitLibrary(event.target.files)
);
$('#visitPhotoLibraryClose').addEventListener(
  'click',
  closeVisitPhotoLibrary
);

$('#visitPhotoLibraryCancel').addEventListener(
  'click',
  closeVisitPhotoLibrary
);

$('#visitPhotoLibraryAdd').addEventListener(
  'click',
  addSelectedLibraryPhotos
);

$('#visitPhotoLibraryGrid').addEventListener('change', event => {
  const checkbox = event.target.closest('[data-library-photo]');
  if (!checkbox) return;

  const id = checkbox.dataset.libraryPhoto;

  if (checkbox.checked) {
    state.visitPhotoLibrarySelection.add(id);
  } else {
    state.visitPhotoLibrarySelection.delete(id);
  }
});

function bindUniquePhotoInput(inputId) {
  const input = $(inputId);
  if (!input || input.dataset.vfgPhotoBound === '1') return;

  input.dataset.vfgPhotoBound = '1';

  input.addEventListener('change', async event => {
    try {
      await addSelectedPhotos(event.target.files);
    } finally {
      // Au cas où une erreur imprévue survient, ne jamais laisser
      // le verrou bloqué pour la photo suivante.
      state.photoInputProcessing = false;
    }
  });
}

bindUniquePhotoInput('#cameraPhotoInput');
bindUniquePhotoInput('#galleryPhotoInput');

$('#photoGallery').addEventListener('click', async event => {
      const view = event.target.closest('[data-photo-view]');
      const remove = event.target.closest('[data-photo-delete]');
      const main = event.target.closest('[data-photo-main]');
      const report = event.target.closest('[data-photo-report]');
      const edit = event.target.closest('[data-photo-edit]');
      if (edit) await openPhotoEditor(edit.dataset.photoEdit);
      else if (view) await viewPhoto(view.dataset.photoView);
      else if (remove) await deleteDraftPhoto(remove.dataset.photoDelete);
      else if (main) {
        state.draftPhotos.forEach(photo => { photo.isMain = photo.id === main.dataset.photoMain; });
        await renderPhotoGallery();
      } else if (report) {
        const photo = state.draftPhotos.find(item => item.id === report.dataset.photoReport);
        if (photo) photo.includeInReport = !photo.includeInReport;
        await renderPhotoGallery();
      }
    });
    $('#photoViewerClose').addEventListener('click', closePhotoViewer);
    $('#photoViewer').addEventListener('click', event => { if (event.target.id === 'photoViewer') closePhotoViewer(); });
    $('#photoEditorClose').addEventListener('click', closePhotoEditor);
    $('#photoEditorCancel').addEventListener('click', closePhotoEditor);
    $('#photoEditorSave').addEventListener('click', savePhotoEditor);
    $('#photoEditorRotateLeft').addEventListener('click', () => rotateEditor(-1));
    $('#photoEditorRotateRight').addEventListener('click', () => rotateEditor(1));
    $('#photoEditorText').addEventListener('click', addEditorText);
    $('#photoEditorApplyCrop').addEventListener('click', applyEditorCrop);
    $('#photoEditorUndo').addEventListener('click', () => restoreEditorSnapshot(state.photoEditor.historyIndex - 1));
    $('#photoEditorRedo').addEventListener('click', () => restoreEditorSnapshot(state.photoEditor.historyIndex + 1));
    document.querySelectorAll('[data-editor-tool]').forEach(button => button.addEventListener('click', () => setEditorTool(button.dataset.editorTool)));
    const editCanvas = $('#photoEditorCanvas');
    editCanvas.addEventListener('pointerdown', onEditorPointerDown);
    editCanvas.addEventListener('pointermove', onEditorPointerMove);
    editCanvas.addEventListener('pointerup', onEditorPointerUp);
    editCanvas.addEventListener('pointercancel', onEditorPointerUp);
    $('#pointActionDialog').addEventListener('click', event => { if (event.target.id === 'pointActionDialog') closePointActions(); });
    bindReadingSequence();
    bindControllerSequence();
    document.querySelectorAll('[data-quick-nav]').forEach(button => button.addEventListener('click', () => {
      const target = button.dataset.quickNav;
      if (target === 'dashboard') {
        renderDashboard();
        showScreen('dashboard');
      } else if (target === 'carrier' || target === 'upper') {
        renderZone(target);
      }
    }));
 
  }
  function machineEmoji(machine) {
  const code = String(
    machine?.parkNumber ||
    machine?.id ||
    machine?.category ||
    ''
  ).toUpperCase();

  if (code.startsWith('CN')) return '🚐';
  if (code.startsWith('CB')) return '🚚';
  return '🏗️';
}

function renderCompactRecentMachines() {
  const container = $('#recentMachines');
  if (!container) return;

  const recents = Array.isArray(state.recents) ? state.recents : [];
  container.replaceChildren();

  if (!recents.length) {
    const empty = document.createElement('div');
    empty.className = 'empty-state';
    empty.textContent = 'Aucune machine récente.';
    container.appendChild(empty);
    return;
  }

  const latest = recents[0];
  const others = recents.slice(1);

  const wrapper = document.createElement('div');
  wrapper.className = 'recent-compact-block';

  wrapper.innerHTML = `
    <div class="recent-compact-header">
      <strong>Dernière machine utilisée</strong>
      ${
        others.length
          ? `<button type="button" id="toggleRecentMachines" class="text-button">
               Voir les récentes (${others.length})
             </button>`
          : ''
      }
    </div>

    <button type="button" class="machine-row recent-main-row" id="openLatestRecent">
      <span class="machine-icon" aria-hidden="true">${machineEmoji(latest)}</span>
      <span class="machine-main">
        <strong>${escapeHtml(latest.parkNumber || latest.id || '')}</strong>
        <span>
          ${escapeHtml(
            [latest.brand, latest.model].filter(Boolean).join(' · ')
          )}
        </span>
        <span>
          ${escapeHtml(
            [latest.company, latest.agency].filter(Boolean).join(' - ')
          )}
        </span>
      </span>
      <span class="machine-arrow" aria-hidden="true">›</span>
    </button>

    <div id="recentMachinesDropdown" class="recent-dropdown hidden"></div>
  `;

  container.appendChild(wrapper);

  $('#openLatestRecent')?.addEventListener('click', () => {
    openMachine(latest);
  });

  const dropdown = $('#recentMachinesDropdown');

  if (dropdown && others.length) {
    others.forEach(machine => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'machine-row recent-sub-row';
      button.innerHTML = `
        <span class="machine-icon" aria-hidden="true">${machineEmoji(machine)}</span>
        <span class="machine-main">
          <strong>${escapeHtml(machine.parkNumber || machine.id || '')}</strong>
          <span>
            ${escapeHtml(
              [machine.brand, machine.model].filter(Boolean).join(' · ')
            )}
          </span>
          <span>
            ${escapeHtml(
              [machine.company, machine.agency].filter(Boolean).join(' - ')
            )}
          </span>
        </span>
        <span class="machine-arrow" aria-hidden="true">›</span>
      `;
      button.addEventListener('click', () => openMachine(machine));
      dropdown.appendChild(button);
    });
  }

  $('#toggleRecentMachines')?.addEventListener('click', event => {
    const block = $('#recentMachinesDropdown');
    if (!block) return;

    const isHidden = block.classList.toggle('hidden');
    event.currentTarget.textContent = isHidden
      ? `Voir les récentes (${others.length})`
      : 'Masquer les récentes';
  });
}
  async function init() {
    ensurePoint1Styles();
    ensureCbEquipmentUi();
    ensureCnEquipmentUi();
    ensureOptionalEquipmentUi();
    ensureSupplementaryControlsUi();
    ensurePointStatusUi();
    ensureTyreSectionStatusUi();
    ensureVisitScopeUi();
    ensureFinishVisitUi();
    registerEmergencyLocalSave();

    screens.search = $('#searchScreen');
    screens.dashboard = $('#dashboardScreen');
    screens.zone = $('#zoneScreen');
    screens.findings = $('#findingsScreen');
    screens.inspection = $('#inspectionScreen');
    screens.tyres = $('#tyreScreen');
    screens.findingForm = $('#findingFormScreen');
    screens.placeholder = $('#placeholderScreen');
    screens.report = $('#reportScreen');
    await loadVisitsFromServer();
loadRecents();
   renderCompactRecentMachines();
    bindEvents();
    try {
      state.machines = await loadMachines();
      document.documentElement.dataset.parcLoaded = 'true';
      refreshSearch();

      const resumed = await offerResumeActiveVisit();

      if (!resumed) {
        toast(`${state.machines.length} machines chargées.`);
      }
    } catch (error) {
      console.error(error);
      toast(error.message || 'Impossible de charger le parc matériel.');
    }
  }

  document.addEventListener('DOMContentLoaded', init);
})();

