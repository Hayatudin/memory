export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type MainTabParamList = {
  MemoriesTab: undefined;
  CreateTab: undefined;
  SearchTab: undefined;
  ProfileTab: undefined;
};

export type MemoryStackParamList = {
  MemoryList: undefined;
  MemoryDetail: { memoryId: string };
  CreateMemory: undefined;
};
