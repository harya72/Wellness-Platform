import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetModal,
  BottomSheetModalProvider,
} from "@gorhom/bottom-sheet";
import { useUI } from "./UiProvider";
import { useBottomSheetBackHandler } from "@utils/bottomSheetUtils";

interface ShowBottomSheetProps {
  view: ReactNode;
  backDropAction?: () => void;
  extraAction?:()=>void;
  snapPoints?: string[];
}

interface CustomBottomSheetContextTypes {
  showBottomSheet: (props: ShowBottomSheetProps) => Promise<void>;
  hideBottomSheet: () => Promise<void>;
  isVisible: boolean;
  bottomSheetRef:React.RefObject<BottomSheetModal | null>;
}

const CustomBottomSheetContext = createContext<
  CustomBottomSheetContextTypes | undefined
>(undefined);

export const CustomBottomSheetProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [content, setContent] = useState<ReactNode>(null);
  const bottomSheetRef = useRef<BottomSheetModal | null>(null);
  const { theme } = useUI();
  const [snapPoints, setSnapPoints] = useState<string[] | null>(null);
  const backDropActionRef = useRef<(() => void) | null>(null);
  const extraActionRef = useRef<(() => void) | null>(null);
  const {handleSheetPositionChange} = useBottomSheetBackHandler(bottomSheetRef)

  const showBottomSheet = async ({
    view,
    backDropAction,
    snapPoints,
    extraAction
  }: ShowBottomSheetProps): Promise<void> => {
    if (snapPoints?.length) {
      setSnapPoints(() => snapPoints);
    }
    if (backDropAction) {
      backDropActionRef.current = backDropAction;
    }

    if(extraAction) extraActionRef.current = extraAction;
    setContent(() => view);
    setIsVisible(true);
  };

  const hideBottomSheet = async () => {
    bottomSheetRef.current?.dismiss();
    extraActionRef?.current?.();
  };

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        onPress={() => {
          if (backDropActionRef.current) {
            backDropActionRef.current();
            setIsVisible(false);
            setContent(null);
          }
        }}
      />
    ),
    []
  );

  useEffect(() => {
    if (isVisible && content && bottomSheetRef.current) {
      bottomSheetRef.current.present();
    }
  }, [isVisible, content]);

  return (
    <CustomBottomSheetContext.Provider
      value={{ isVisible, hideBottomSheet, showBottomSheet,bottomSheetRef }}
    >
      {children}
      {isVisible && (
        <BottomSheetModalProvider>
          <BottomSheetModal
            ref={bottomSheetRef}
            onChange={(index,position,type) => {
              handleSheetPositionChange(index,position,type);
              if (index === -1) extraActionRef?.current?.();
            }}
            enableHandlePanningGesture={
              backDropActionRef?.current === null ? true : false
            }
            enableContentPanningGesture={
              backDropActionRef?.current === null ? true : false
            }
            enableDynamicSizing
            handleIndicatorStyle={{
              backgroundColor: theme.disabled,
              width: "20%",
            }}
            backgroundStyle={{ backgroundColor: theme.background }}
            snapPoints={snapPoints || ["50%"]}
            backdropComponent={renderBackdrop}
          >
            {content}
          </BottomSheetModal>
        </BottomSheetModalProvider>
      )}
    </CustomBottomSheetContext.Provider>
  );
};

export const useCustomBottomSheet = (): CustomBottomSheetContextTypes => {
  const context = useContext(CustomBottomSheetContext);
  if (!context) {
    throw new Error(
      "useBottomSheet must be used within a CustomBottomSheetProvider"
    );
  }
  return context;
};
