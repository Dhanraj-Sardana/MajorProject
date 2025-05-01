import React, { useEffect, useState } from "react";

function Conflict() {
  const [conflictText, setConflictText] = useState("");

  useEffect(() => {
    if (window.electronAPI?.onConflictData) {
      window.electronAPI.onConflictData((data) => {
        setConflictText(data);
      });
    }
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold text-red-600">Merge Conflict</h2>
      <pre className="bg-black text-green-300 p-4 overflow-auto max-h-96 whitespace-pre-wrap">{conflictText}</pre>
      <button
  className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
  onClick={() => window.electronAPI.closeConflictWindow()}
>
  Close Conflict Window
</button>

    </div>
  );
}

export default Conflict;