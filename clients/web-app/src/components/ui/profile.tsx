"use client";

import {
  ArchiveXIcon,
  ArrowRightIcon,
  BellIcon,
  CheckIcon,
  CogIcon,
  FilmIcon,
  GaugeIcon,
  HeartCrackIcon,
  LogOutIcon,
  SearchIcon,
  UsersRoundIcon,
  XIcon,
} from "lucide-react";
import { Fragment, useState } from "react";
import { format, parseISO } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./dropdown-menu";
import { Button } from "./button";
import { Link } from "react-router";
import { Spinner } from "./spinner";
import { Avatar, AvatarFallback, AvatarImage } from "./avatar";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/services/api";
import type { Profile as ProfileType } from "@/types/app";

export const Profile = () => {
  const { data: profile, isLoading } = useQuery<ProfileType>({
    queryKey: ["profiles", "me"],
    queryFn: () =>
      apiClient()
        .v1.profile.get()
        .then((r) => r.data),
    staleTime: 99999999,
  });

  if (isLoading) return <Spinner />;

  if (!profile)
    return (
      <Button color="white" size="sm" asChild>
        <Link to="/profiles/create">New profile</Link>
      </Button>
    );

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center justify-end gap-2">
        <Link
          className="p-2 text-app-primary-foreground-muted hover:text-app-primary-foreground border border-white/10 rounded-md transition-all cursor-pointer"
          to="/search"
        >
          <SearchIcon className="size-5" />
        </Link>
        <Notifications />
        {/* <Friends /> */}
      </div>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger>
          <Avatar className="size-12 border border-white/10 hover:border-white/25 cursor-pointer transition-colors">
            <AvatarImage src={profile.avatarUrl!} alt="Profile's avatar" />
            <AvatarFallback>ZS</AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          side="bottom"
          sideOffset={8}
          align="end"
          className="z-999 min-w-48"
        >
          <header className="p-2">
            <h3 className="text-sm text-primary-foreground">
              {profile.nickname}
            </h3>
            <p className="text-xs text-app-primary-foreground-muted">
              {profile.tagline}
            </p>
          </header>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            Dashboard
            <GaugeIcon />
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to="/media-center">
              Media center
              <FilmIcon />
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem>
            Settings
            <CogIcon />
          </DropdownMenuItem>
          <DropdownMenuItem>
            Logout
            <LogOutIcon />
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

const Notifications = () => {
  const [isOpen, setIsOpen] = useState(false);
  //a
  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen} modal={false}>
      <DropdownMenuTrigger asChild>
        <button
          className="p-2 text-app-primary-foreground-muted hover:text-app-primary-foreground border border-white/10 rounded-md transition-all cursor-pointer"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onKeyDown={(e) => e.preventDefault()}
          onFocus={(e) => e.preventDefault()}
        >
          <BellIcon className="size-5" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        side="bottom"
        sideOffset={8}
        align="end"
        className="p-0 z-999 min-w-md"
      >
        <header className="p-4 border-b border-white/10 flex items-center justify-between gap-8">
          <div>
            <h1 className="text-sm text-app-secondary-foreground">
              List of notifications
            </h1>
          </div>
        </header>
        <div className="p-4 min-h-48">
          <div className="w-full h-full min-h-48 flex flex-col items-center justify-center">
            <ArchiveXIcon className="size-8 text-red-500" />
            <h2 className="mt-2 text-base font-bold text-app-secondary-foreground">
              Oppsss
            </h2>
            <p className="text-sm text-app-secondary-foreground-muted">
              Sadly we didn't find any notification sended to you.
            </p>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

// const Friends = () => {
//   const { data: friendshipRequests, isLoading: isFriendshipRequestsLoading } =
//     useQuery({
//       queryKey: ["friend-requests"],
//       queryFn: StreamingApi.social.friendship.getRequests,
//     });

//   const { data: friends } = useQuery({
//     queryKey: ["friends"],
//     queryFn: StreamingApi.social.friendship.getAll,
//   });

//   const [isOpen, setIsOpen] = useState(false);

//   return (
//     <DropdownMenu open={isOpen} onOpenChange={setIsOpen} modal={false}>
//       <DropdownMenuTrigger asChild>
//         <button
//           className="p-2 text-app-primary-foreground-muted hover:text-app-primary-foreground border border-white/10 rounded-md transition-all cursor-pointer"
//           onClick={(e) => {
//             e.preventDefault();
//             e.stopPropagation();
//           }}
//           onKeyDown={(e) => e.preventDefault()}
//           onFocus={(e) => e.preventDefault()}
//         >
//           <UsersRoundIcon className="size-5" />
//         </button>
//       </DropdownMenuTrigger>
//       <DropdownMenuContent
//         side="bottom"
//         sideOffset={8}
//         align="end"
//         className="p-0 z-999 min-w-xl max-h-96 overflow-y-auto no-scrollbar"
//       >
//         <header className="p-4 py-4 border-b border-white/10 flex items-center justify-between gap-8">
//           <div>
//             <h1 className="text-sm text-app-primary-foreground">
//               List of all your friends
//             </h1>
//           </div>
//           {/* <Button size='sm'>
//               Search <UsersRoundIcon />
//             </Button> */}
//         </header>
//         <div className="p-4 flex flex-col gap-4">
//           {friendshipRequests && friendshipRequests.length > 0 && (
//             <div className="flex flex-col gap-2">
//               {friendshipRequests.map((friendshipRequest) => (
//                 <div
//                   className="p-2 px-4 bg-app-secondary border border-white/10 rounded-md flex items-center justify-between gap-4"
//                   key={friendshipRequest.from.id}
//                 >
//                   <header>
//                     <p className="text-sm text-primary-foreground">
//                       {friendshipRequest.from.username}
//                     </p>
//                     <p className="text-xs text-app-primary-foreground-muted">
//                       {format(
//                         parseISO(friendshipRequest.createdAt),
//                         "MMMM dd',' yyyy"
//                       )}
//                     </p>
//                   </header>

//                   <div className="flex items-center justify-end gap-2">
//                     <Button
//                       variant="secundary"
//                       size="iconSm"
//                       title="Deny friend request"
//                     >
//                       <XIcon />
//                     </Button>

//                     <Button
//                       variant="secundary"
//                       size="iconSm"
//                       title="Accept friend request"
//                     >
//                       <CheckIcon />
//                     </Button>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}

//           {friends && (
//             <Fragment>
//               {friends.length > 0 ? (
//                 <div className="flex flex-col gap-2">
//                   {friends.map((user) => (
//                     <div
//                       className="p-4 bg-app-secondary border border-white/10 rounded-md flex items-center justify-between gap-4"
//                       key={user.id}
//                     >
//                       <header className="flex items-center gap-2">
//                         <Avatar className="size-10">
//                           <AvatarImage
//                             src={user.profile.avatarUrl}
//                             alt="Avatar"
//                           />
//                           {/*Badge  <div className='absolute bottom-1.5 right-1.5 translate-x-1/2 translate-y-1/2 bg-app-secondary rounded-full block p-1'>
//                               <div className='size-3 bg-red-500 rounded-full' />
//                             </div> */}
//                         </Avatar>
//                         <div>
//                           <p className="text-sm text-primary-foreground">
//                             {user.username}
//                           </p>
//                           <p className="text-xs text-app-primary-foreground-muted">
//                             {format(
//                               parseISO(user.friendship.createdAt),
//                               "MMMM dd',' yyyy"
//                             )}
//                           </p>
//                         </div>
//                       </header>

//                       <div className="flex items-center justify-end gap-2">
//                         <Button
//                           variant="secundary"
//                           size="sm"
//                           title="Deny friend request"
//                           asChild
//                         >
//                           <Link to={`/profiles/${user.id}`}>
//                             Ver perfil <ArrowRightIcon />
//                           </Link>
//                         </Button>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               ) : (
//                 <div className="w-full h-full min-h-48 flex flex-col items-center justify-center">
//                   <HeartCrackIcon className="size-8 text-red-500" />
//                   <h2 className="mt-2 text-base font-bold text-app-secondary-foreground">
//                     Ohhhh no
//                   </h2>
//                   <p className="text-sm text-app-secondary-foreground-muted">
//                     It looks like you don't have any friend :{"("}
//                   </p>
//                   <Button className="mt-2" size="sm" asChild>
//                     <Link to="/social/search">Search for friends</Link>
//                   </Button>
//                 </div>
//               )}
//             </Fragment>
//           )}
//         </div>
//       </DropdownMenuContent>
//     </DropdownMenu>
//   );
// };
