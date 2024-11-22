import Header from "./Header";
import MainContent from "./MainContent";
import Sirbar from "./Sirbar";

export default function Content() {
  return (
    <div className="flex w-full ">
      {/* sibar */}
      <Sirbar />
      {/* main  */}
      <div className="flex-[5] relative">
        <div className="w-full">
          <Header />
        </div>
        <div className="bg-custom-gray   h-auto">
          <MainContent />
        </div>
      </div>
    </div>
  );
}
