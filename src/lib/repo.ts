export type Contribution = {
  id: string;
  name: string;
  message: string | null;
  amount: number;
  createdAt: string;
};

export type NewContribution = {
  name: string;
  message: string | null;
  amount: number;
};

export interface ContributionRepo {
  /** 최신순 */
  list(): Promise<Contribution[]>;
  add(input: NewContribution): Promise<void>;
}
