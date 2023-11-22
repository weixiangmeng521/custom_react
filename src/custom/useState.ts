type SetStateAction<T> = T | ((prevState: T) => T);

interface StateHook<T> {
  state: T;
  setState: (value: SetStateAction<T>) => void;
}

// A global array to store state values
const globalState: any[] = [];
let globalIndex = 0;

function useState<T>(initialValue: T): StateHook<T> {
  const currentIndex = globalIndex;

  // If the state at the current index is undefined, set it to the initial value
  if (globalState[currentIndex] === undefined) {
    globalState[currentIndex] = initialValue;
  }

  function setState(value: SetStateAction<T>): void {
    // Update the state based on the type of the value
    if (typeof value === 'function') {
      // If the value is a function, apply it to the previous state
      globalState[currentIndex] = (value as (prevState: T) => T)(globalState[currentIndex]);
    } else {
      // If the value is not a function, set it directly
      globalState[currentIndex] = value;
    }

    // Trigger re-render (in a real React implementation, this would schedule a re-render)
    // render();
  }

  // Move to the next index for the next call to useState
  globalIndex += 1;

  // Return the current state and the setState function
  return {
    state: globalState[currentIndex],
    setState,
  };
}

export {
    useState,
}