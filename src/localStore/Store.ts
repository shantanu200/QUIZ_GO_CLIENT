import { TAttempt } from "@/types/TAttempt";
import { Action } from "@radix-ui/react-toast";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

type State = {
  isLoggedIn: boolean;
  currentQuiz: string;
  quizTime: number;
  quizAttemptMap: TAttempt;
  qIdx: number;
  boardId: string;
};

type Action = {
  setIsLoggedIn: (value: State["isLoggedIn"]) => void;
  setCurrentQuiz: (value: State["currentQuiz"]) => void;
  setQuizTime: (value: State["quizTime"]) => void;
  decrementQuizTime: () => void;
  setQuizAttemptMap: (value: State["quizAttemptMap"]) => void;
  setqIdx: (value: State["qIdx"]) => void;
  setBoardId: (value: State["boardId"]) => void;
};

const localStore = create<State & Action>()(
  persist(
    (set, get) => ({
      isLoggedIn: false,
      setIsLoggedIn: (value) => set({ isLoggedIn: value }),
      currentQuiz: "",
      setCurrentQuiz: (value) => set({ currentQuiz: value }),
      boardId: "",
      quizTime: -1,
      qIdx: 0,
      quizMetaData: {},
      setQuizTime: (value) => set({ quizTime: value }),
      quizAttemptMap: {},
      setQuizAttemptMap: (value) => set({ quizAttemptMap: value }),
      decrementQuizTime: () =>
        set({ quizTime: get().quizTime - 1 > 0 ? get().quizTime - 1 : -1 }),
      setqIdx: (value) => {
        if (value === 999) {
          set({ qIdx: get().qIdx + 1 });
        } else if (value === -999) {
          set({ qIdx: get().qIdx - 1 });
        } else {
          set({ qIdx: value });
        }
      },
      setBoardId: (value) => set({ boardId: value }),
    }),

    {
      name: "local-store",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export default localStore;
