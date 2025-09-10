import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

export default function Private() {
  const navigate = useNavigate();

  return (
    <div className="fixed inset-0 flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">站点已设为私有</CardTitle>
          <CardDescription>登录后才能获取数据</CardDescription>
        </CardHeader>
        <CardFooter>
          <Button onClick={() => navigate("/admin")} className="w-full">
            前往登录
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
