/**
 * Siya Health internal credentialing export — source of truth for contracted clinicians.
 * Merged into providers.mjs at build. Public badges derive from computed credentialStatus.
 */
import { resolveProviderPhoto } from './providers-core.mjs';

export const CREDENTIAL_VERIFIED_BY = 'Siya Health Credentialing';
export const CREDENTIAL_VERIFIED_DATE = '2026-06-02';

const BOARD_LOOKUP = {
  CA: 'https://search.dca.ca.gov/',
  TX: 'https://www.tmb.state.tx.us/page/look-up-a-license',
  PA: 'https://www.pals.pa.gov/',
  FL: 'https://mqa-internet.doh.state.fl.us/MQASearchServices/HealthcareProviders',
  OH: 'https://elicense.ohio.gov/oh_verifylicense',
};

function licenseEntries(states, licenseType) {
  return states.map((state) => {
    const abbr = { California: 'CA', Texas: 'TX', Pennsylvania: 'PA', Florida: 'FL', Ohio: 'OH' }[state];
    return {
      state,
      licenseType,
      status: 'Active',
      verificationUrl: BOARD_LOOKUP[abbr] || null,
      acceptingNewPatients: true,
    };
  });
}

export function licensesInternallyComplete(licenses = []) {
  return licenses.length > 0 && licenses.every((l) => Boolean(String(l.licenseNumber || '').trim()));
}

export function isInternalCredentialRecordComplete(internal) {
  if (!internal) return false;
  return Boolean(internal.npi) && licensesInternallyComplete(internal.licenses);
}

/** verified only when internal file is complete; contracted roster defaults to active_internal */
export function computeCredentialStatus(internal) {
  if (!internal) return 'pending_internal';
  if (internal.credentialStatusOverride) return internal.credentialStatusOverride;
  if (isInternalCredentialRecordComplete(internal)) return 'verified';
  return 'active_internal';
}

export function formatCredentialBadge(status) {
  switch (status) {
    case 'verified':
      return 'Credentials verified';
    case 'active_internal':
      return 'Active Siya Health clinician';
    case 'pending_internal':
      return 'Credential details updating';
    default:
      return 'Credential details updating';
  }
}

export function formatCredentialMeta(provider) {
  if (provider.credentialStatus === 'verified') {
    const by = provider.credentialVerifiedBy ? ` by ${provider.credentialVerifiedBy}` : '';
    const date = provider.credentialVerifiedDate ? ` (${provider.credentialVerifiedDate})` : '';
    return `Credentials verified${by}${date}.`;
  }
  return formatCredentialBadge(provider.credentialStatus);
}

/** @type {Record<string, object>} */
export const INTERNAL_PROVIDER_RECORDS = {
  'dr-sneh-pandey': {
    providerType: 'physician',
    providerCategory: 'physician',
    hubSection: 'physicians',
    sortOrder: 1,
    featured: true,
    photoStatus: 'approved',
    npi: null,
    licenses: licenseEntries(['California', 'Texas', 'Pennsylvania', 'Florida'], 'MD'),
    education: {
      medicalSchool: null,
      graduationYear: null,
      residency: null,
      fellowship: null,
    },
    boardCertifications: [
      { name: 'Board Certified Internal Medicine', verificationUrl: 'https://www.abim.org/verify-a-physician/' },
      { name: 'Obesity Medicine', verificationUrl: 'https://www.abom.org/verify/' },
      { name: 'ADHD-CCSP (ADHD Clinical Services Provider Program)', verificationUrl: null },
    ],
    credentialVerifiedBy: CREDENTIAL_VERIFIED_BY,
    credentialVerifiedDate: CREDENTIAL_VERIFIED_DATE,
    acceptingNewPatients: true,
    sameAs: ['https://www.helloklarity.com/provider/sneh-pandey'],
    supervisionNote: null,
  },
  'dr-natasha-desai': {
    providerType: 'physician',
    providerCategory: 'physician',
    hubSection: 'physicians',
    sortOrder: 3,
    featured: true,
    photoStatus: 'approved',
    npi: null,
    licenses: licenseEntries(['Texas', 'Florida'], 'MD'),
    education: { medicalSchool: null, graduationYear: null, residency: null, fellowship: null },
    boardCertifications: [
      { name: 'Family & Behavioral Medicine', verificationUrl: 'https://www.abfm.org/verify/' },
      { name: 'ADHD-CCSP', verificationUrl: null },
    ],
    credentialVerifiedBy: CREDENTIAL_VERIFIED_BY,
    credentialVerifiedDate: CREDENTIAL_VERIFIED_DATE,
    acceptingNewPatients: true,
    sameAs: ['https://www.helloklarity.com/provider/natasha-desai'],
    supervisionNote: null,
  },
  'dr-swati-pandey': {
    providerType: 'physician',
    providerCategory: 'physician',
    hubSection: 'physicians',
    sortOrder: 4,
    featured: true,
    photoStatus: 'approved',
    npi: null,
    licenses: licenseEntries(['Pennsylvania'], 'MD'),
    education: { medicalSchool: null, graduationYear: null, residency: null, fellowship: null },
    boardCertifications: [
      { name: 'ADHD-CCSP (ADHD Clinical Services Provider Program)', verificationUrl: null },
    ],
    credentialVerifiedBy: CREDENTIAL_VERIFIED_BY,
    credentialVerifiedDate: CREDENTIAL_VERIFIED_DATE,
    acceptingNewPatients: true,
    sameAs: ['https://www.helloklarity.com/provider/swati-pandey'],
    supervisionNote: null,
    role: 'Licensed Medical Provider — ADHD & Mental Health Care',
  },
  'dr-vanessa-urbina': {
    providerType: 'physician',
    providerCategory: 'physician',
    hubSection: 'physicians',
    sortOrder: 2,
    featured: true,
    photoStatus: 'approved',
    npi: null,
    licenses: licenseEntries(['Florida'], 'MD'),
    education: {
      medicalSchool: 'University of Miami Miller School of Medicine',
      graduationYear: 2007,
      undergraduate: 'Florida Atlantic University (2003)',
      residency: 'Brookwood Baptist Health',
      fellowship: null,
    },
    boardCertifications: [{ name: 'Family Medicine', verificationUrl: 'https://www.abfm.org/verify/' }],
    credentialVerifiedBy: CREDENTIAL_VERIFIED_BY,
    credentialVerifiedDate: CREDENTIAL_VERIFIED_DATE,
    acceptingNewPatients: true,
    sameAs: ['https://www.comphealthforyou.com/about-dr-vanessa-urbina'],
    supervisionNote: null,
    role: 'Family Medicine Physician',
  },
  'megan-wunderlich': {
    providerType: 'advanced-practice',
    providerCategory: 'np',
    hubSection: 'advanced-practice',
    sortOrder: 5,
    featured: false,
    photoStatus: 'approved',
    npi: '1629930532',
    licenses: licenseEntries(['Pennsylvania'], 'APRN-FNP'),
    education: {
      undergraduate: 'Duquesne University BSN (2006–2010)',
      graduate: 'Chatham University MSN Leadership (2011–2012)',
      postGraduate: 'Carlow University PMC-FNP (2020–2022)',
      residency: null,
      fellowship: null,
    },
    boardCertifications: [{ name: 'FNP-C', verificationUrl: 'https://www.nursingworld.org/our-certifications/' }],
    credentialVerifiedBy: CREDENTIAL_VERIFIED_BY,
    credentialVerifiedDate: CREDENTIAL_VERIFIED_DATE,
    acceptingNewPatients: true,
    sameAs: ['https://www.helloklarity.com/provider/megan-wunderlich'],
    supervisionNote: 'Practice under collaborative physician agreements per state law.',
    role: 'Family Nurse Practitioner',
    languages: ['English'],
  },
  'derek-timbs': {
    providerType: 'advanced-practice',
    providerCategory: 'np',
    hubSection: 'advanced-practice',
    sortOrder: 6,
    featured: false,
    photoStatus: 'approved',
    npi: '1609886910',
    licenses: licenseEntries(['Texas', 'Ohio'], 'APRN-FNP'),
    education: {
      graduate: 'MSN, Family Nurse Practitioner',
      residency: null,
      fellowship: null,
    },
    boardCertifications: [{ name: 'FNP-BC', verificationUrl: 'https://www.nursingworld.org/our-certifications/' }],
    credentialVerifiedBy: CREDENTIAL_VERIFIED_BY,
    credentialVerifiedDate: CREDENTIAL_VERIFIED_DATE,
    acceptingNewPatients: true,
    sameAs: [
      'https://www.helloklarity.com/provider/derek-timbs',
      'https://www.linkedin.com/in/derek-timbs-a54247320/',
    ],
    supervisionNote: 'Practice under collaborative physician agreements per state law.',
    role: 'Family Nurse Practitioner',
    languages: ['English'],
  },
  'wendy-delgado': {
    providerType: 'advanced-practice',
    providerCategory: 'pa',
    hubSection: 'advanced-practice',
    sortOrder: 7,
    featured: false,
    photoStatus: 'pending',
    npi: '1063725059',
    licenses: [
      {
        state: 'California',
        licenseType: 'PA',
        licenseNumber: '20963',
        status: 'Active',
        verificationUrl: BOARD_LOOKUP.CA,
        acceptingNewPatients: true,
      },
    ],
    education: {
      graduate: 'Western University of Health Sciences PA Program (2007–2009)',
      residency: null,
      fellowship: null,
    },
    boardCertifications: [{ name: 'NCCPA Certified PA', verificationUrl: 'https://www.nccpa.net/verify' }],
    credentialVerifiedBy: CREDENTIAL_VERIFIED_BY,
    credentialVerifiedDate: CREDENTIAL_VERIFIED_DATE,
    acceptingNewPatients: true,
    sameAs: [
      'https://www.doximity.com/pub/wendy-delgado-pa',
      'https://www.arrivehw.com/wendy-delgado',
    ],
    supervisionNote: 'Practice under physician supervision per state law.',
    role: 'Physician Associate',
    languages: ['English'],
  },
};

export function applyInternalRecords(provider) {
  const internal = INTERNAL_PROVIDER_RECORDS[provider.slug];
  if (!internal) return provider;

  const boardNames = internal.boardCertifications.map((b) => b.name);
  const edu = internal.education;
  const credentialStatus = computeCredentialStatus(internal);
  const photo = resolveProviderPhotoFromInternal(provider, internal);

  return {
    ...provider,
    providerType: internal.providerType,
    providerCategory: internal.providerCategory,
    hubSection: internal.hubSection,
    sortOrder: internal.sortOrder,
    featured: internal.featured,
    role: internal.role || provider.role,
    photoStatus: internal.photoStatus || 'pending',
    photo: photo.src,
    altText: photo.alt,
    licenses: internal.licenses,
    npi: internal.npi,
    education: edu?.medicalSchool || edu?.graduate || edu?.undergraduate ? edu : provider.education,
    residency: edu?.residency ?? provider.residency,
    fellowship: edu?.fellowship ?? provider.fellowship,
    boardCertifications: boardNames.length ? boardNames : provider.boardCertifications,
    boardCertificationDetails: internal.boardCertifications,
    credentialStatus,
    credentialVerifiedBy: credentialStatus === 'verified' ? internal.credentialVerifiedBy : null,
    credentialVerifiedDate: credentialStatus === 'verified' ? internal.credentialVerifiedDate : null,
    acceptingNewPatients: internal.acceptingNewPatients,
    sameAs: internal.sameAs,
    supervisionNote: internal.supervisionNote,
    languages: internal.languages?.length ? internal.languages : provider.languages,
    statesLicensed: internal.licenses.map((l) => l.state),
    stateAbbreviations: internal.licenses.map((l) => {
      const map = { California: 'CA', Texas: 'TX', Pennsylvania: 'PA', Florida: 'FL', Ohio: 'OH' };
      return map[l.state];
    }),
  };
}

function resolveProviderPhotoFromInternal(provider, internal) {
  return resolveProviderPhoto({ ...provider, photoStatus: internal.photoStatus || 'pending' });
}
