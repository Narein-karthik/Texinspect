import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  updateDoc,
  deleteDoc,
  onSnapshot
} from 'firebase/firestore';

import { db, auth } from '../lib/firebase';
import { Inspection } from '../types';
import { getCertificateRef, getDefaultFabricConstruction } from '../lib/utils';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
) {

  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),

    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,

      providerInfo:
        auth.currentUser?.providerData?.map(provider => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || []
    },

    operationType,
    path
  };

  console.error('Firestore Error:', JSON.stringify(errInfo));

  throw new Error(JSON.stringify(errInfo));
}

const INSPECTIONS_COLLECTION = 'inspections';

export const inspectionService = {

  async saveInspection(inspection: Inspection) {

    const path = `${INSPECTIONS_COLLECTION}/${inspection.id}`;

    try {

      // CLEAN undefined values before saving
      const cleanedInspection = JSON.parse(
        JSON.stringify({
          ...inspection,
          certificateRef: getCertificateRef(inspection),
          fabricConstruction: getDefaultFabricConstruction(
            inspection.fabricType,
            inspection.fabricConstruction || {
              gsm: inspection.gsm,
              width: '',
              additionalData: '',
            }
          ),
          updatedAt: new Date().toISOString()
        })
      );

      await setDoc(
        doc(db, INSPECTIONS_COLLECTION, inspection.id),
        cleanedInspection
      );

      console.log("Inspection saved successfully");

    } catch (error) {

      handleFirestoreError(
        error,
        OperationType.WRITE,
        path
      );
    }
  },

  async getInspection(id: string) {

    const path = `${INSPECTIONS_COLLECTION}/${id}`;

    try {

      const docSnap = await getDoc(
        doc(db, INSPECTIONS_COLLECTION, id)
      );

      return docSnap.exists()
        ? (docSnap.data() as Inspection)
        : null;

    } catch (error) {

      handleFirestoreError(
        error,
        OperationType.GET,
        path
      );
    }
  },

  async getUserInspections(userId: string) {

    try {

      const q = query(
        collection(db, INSPECTIONS_COLLECTION),
        where("inspectorId", "==", userId)
      );

      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map(
        doc => doc.data() as Inspection
      );

    } catch (error) {

      handleFirestoreError(
        error,
        OperationType.LIST,
        INSPECTIONS_COLLECTION
      );
    }
  },

  subscribeToInspections(
    userId: string,
    callback: (inspections: Inspection[]) => void
  ) {

    const q = query(
      collection(db, INSPECTIONS_COLLECTION),
      where("inspectorId", "==", userId)
    );

    return onSnapshot(

      q,

      (snapshot) => {

        const inspections = snapshot.docs.map(
          doc => doc.data() as Inspection
        );

        callback(inspections);
      },

      (error) => {

        handleFirestoreError(
          error,
          OperationType.LIST,
          INSPECTIONS_COLLECTION
        );
      }
    );
  },

  subscribeToAllInspections(
    callback: (inspections: Inspection[]) => void
  ) {

    return onSnapshot(

      collection(db, INSPECTIONS_COLLECTION),

      (snapshot) => {

        const inspections = snapshot.docs.map(
          doc => doc.data() as Inspection
        );

        callback(inspections);
      },

      (error) => {

        handleFirestoreError(
          error,
          OperationType.LIST,
          INSPECTIONS_COLLECTION
        );
      }
    );
  }
};
