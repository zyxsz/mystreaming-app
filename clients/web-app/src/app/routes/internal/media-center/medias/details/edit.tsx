import { Player } from "@/components/old-player";
import { useParams } from "react-router";

export default function Page() {
  const { mediaId } = useParams();

  return <p>Edit</p>;
}
