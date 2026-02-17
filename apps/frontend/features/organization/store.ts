"use client";

import { create } from "zustand";

export type Org = { id: string; name: string; slug: string };

type OrganizationState = {
  orgs: Org[];
  selectedOrgId: string;
  setOrgs: (orgs: Org[]) => void;
  setSelectedOrgId: (id: string) => void;
};

export const useOrganizationStore = create<OrganizationState>((set) => ({
  orgs: [],
  selectedOrgId: "",
  setOrgs: (orgs) => set({ orgs }),
  setSelectedOrgId: (id) => set({ selectedOrgId: id }),
}));
