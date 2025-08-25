import { MediaStatus } from "@/components/badges/status/media-status";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatFileSize, secondsToTime } from "@/lib/utils";
import type { MediaGet } from "@/types/app";
import { format, parseISO } from "date-fns";

interface Props {
  media: MediaGet;
}

export const MediaDetails = ({ media }: Props) => {
  return (
    <div className="flex flex-col gap-2">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Status</TableHead>

            <TableHead>Created at</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>{media.id.split("-")[4]}</TableCell>
            <TableCell>{media.name || "N/A"}</TableCell>
            <TableCell>
              {media.status ? <MediaStatus status={media.status} /> : "N/A"}
            </TableCell>
            <TableCell>
              {format(
                parseISO(media.createdAt),
                "MMMM dd',' yyyy hh:mm aaaaa'm'"
              )}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
};
