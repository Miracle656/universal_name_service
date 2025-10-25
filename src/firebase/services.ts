import { 
  collection, 
  query, 
  where, 
  getDocs,
  doc,
  setDoc,
  Timestamp,
  onSnapshot,
  getDocsFromCache,
  getDocsFromServer
} from 'firebase/firestore';
import { db } from './config';

export interface NameRegistration {
  name: string;
  owner: string;
  expiresAt: Date;
  isPremium: boolean;
  nameHash: string;
  registeredAt: Date;
  transactionHash: string;
  chainId?: string;
  metadata?: {
    avatar?: string;
    email?: string;
    url?: string;
    description?: string;
    twitter?: string;
    github?: string;
    discord?: string;
    telegram?: string;
  };
}

// Get names with offline support
export async function getNamesForAddress(address: string): Promise<NameRegistration[]> {
  try {
    const normalizedAddress = address.toLowerCase();
    const namesRef = collection(db, 'names');
    const q = query(namesRef, where('owner', '==', normalizedAddress));
    
    let querySnapshot;
    
    // Try cache first (instant)
    try {
      querySnapshot = await getDocsFromCache(q);
      console.log('📦 Loaded from cache');
    } catch (cacheError) {
      // Cache miss, fetch from server
      console.log('🌐 Fetching from server');
      querySnapshot = await getDocsFromServer(q);
    }
    
    const names: NameRegistration[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const expiresAt = data.expiresAt.toDate();
      
      if (expiresAt > new Date()) {
        names.push({
          name: data.name,
          owner: data.owner,
          expiresAt,
          isPremium: data.isPremium,
          nameHash: data.nameHash,
          registeredAt: data.registeredAt.toDate(),
          transactionHash: data.transactionHash,
          chainId: data.chainId,
          metadata: data.metadata || {},
        });
      }
    });
    
    console.log(`Found ${names.length} names for address:`, address);
    return names;
  } catch (error) {
    console.error('Error fetching names from Firebase:', error);
    throw error;
  }
}

// Store with offline support
export async function storeNameRegistration(data: NameRegistration): Promise<void> {
  try {
    const nameRef = doc(db, 'names', data.name.toLowerCase());
    
    await setDoc(nameRef, {
      name: data.name.toLowerCase(),
      owner: data.owner.toLowerCase(),
      expiresAt: Timestamp.fromDate(data.expiresAt),
      isPremium: data.isPremium,
      nameHash: data.nameHash,
      registeredAt: Timestamp.fromDate(data.registeredAt),
      transactionHash: data.transactionHash,
      chainId: data.chainId || 'push-chain',
      metadata: data.metadata || {},
      updatedAt: Timestamp.now(),
    });

    console.log('✅ Name registration stored in Firebase:', data.name);
  } catch (error) {
    console.error('❌ Error storing name registration:', error);
    throw error;
  }
}

// Real-time listener for name changes
export function subscribeToNameChanges(
  address: string,
  callback: (names: NameRegistration[]) => void
): () => void {
  const normalizedAddress = address.toLowerCase();
  const namesRef = collection(db, 'names');
  const q = query(namesRef, where('owner', '==', normalizedAddress));

  const unsubscribe = onSnapshot(
    q,
    (querySnapshot) => {
      const names: NameRegistration[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const expiresAt = data.expiresAt.toDate();
        
        if (expiresAt > new Date()) {
          names.push({
            name: data.name,
            owner: data.owner,
            expiresAt,
            isPremium: data.isPremium,
            nameHash: data.nameHash,
            registeredAt: data.registeredAt.toDate(),
            transactionHash: data.transactionHash,
            chainId: data.chainId,
            metadata: data.metadata || {},
          });
        }
      });
      
      callback(names);
    },
    (error) => {
      console.error('Real-time listener error:', error);
    }
  );

  return unsubscribe;
}