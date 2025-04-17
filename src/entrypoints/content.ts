export default defineContentScript({
  matches: ["*://*/*"],
  main() {
    console.log("Content script loaded"); // Debug log to confirm script is running

    let pressTimer: number | null = null;
    const LONG_PRESS_DURATION = 1000; // 1 second

    document.addEventListener("mousedown", (e) => {
      const target = e.target as HTMLElement;

      pressTimer = window.setTimeout(() => {
        console.log("Long press detected on element:", target);

        // try {
        //   // Create br element
        //   const br = document.createElement("br");
        //   // Create text node
        //   const text = document.createTextNode("这是长按后添加的文字");

        //   // Insert elements after the target
        //   if (target.parentNode) {
        //     console.log("Parent node found:", target.parentNode); // Debug log
        //     target.parentNode.insertBefore(br, target.nextSibling);
        //     target.parentNode.insertBefore(text, br.nextSibling);
        //     console.log("Elements inserted successfully"); // Debug log
        //   } else {
        //     console.warn("No parent node found for target element"); // Debug log
        //   }
        // } catch (error) {
        //   console.error("Error while inserting elements:", error); // Debug log
        // }
      }, LONG_PRESS_DURATION);
    });

    document.addEventListener("mouseup", () => {
      if (pressTimer) {
        clearTimeout(pressTimer);
        pressTimer = null;
      }
    });

    document.addEventListener("mouseleave", () => {
      if (pressTimer) {
        clearTimeout(pressTimer);
        pressTimer = null;
      }
    });
  },
});
