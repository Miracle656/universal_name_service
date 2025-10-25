import { Header } from "@/components/Header";
import { MyNames as MyNamesComponent } from "@/components/MyNames";

export const MyNames = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <MyNamesComponent />
    </div>
  );
};
