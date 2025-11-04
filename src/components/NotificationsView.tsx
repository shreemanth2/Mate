import { motion } from "motion/react";
import { Heart, Video, Calendar, Bell } from "lucide-react";
import { Badge } from "./ui/badge";

const mockNotifications = [
  {
    id: "1",
    type: "match",
    title: "New Match!",
    description: "You matched with Jordan Lee",
    image:
      "https://images.unsplash.com/photo-1560250097-0b93528c311a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBoZWFkc2hvdHxlbnwxfHx8fDE3NjE5NzQ0MTh8MA&ixlib=rb-4.1.0&q=80&w=1080",
    timestamp: "5m ago",
    unread: true,
  },
  {
    id: "2",
    type: "survey",
    title: "New Video Survey Available",
    description:
      "Help us improve your matches with a quick survey",
    timestamp: "1h ago",
    unread: true,
  },
  {
    id: "3",
    type: "match",
    title: "New Match!",
    description: "You matched with Sam Chen",
    image:
      "https://images.unsplash.com/photo-1636624498155-d87727494812?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzbWlsaW5nJTIwcGVyc29uJTIwb3V0ZG9vcnxlbnwxfHx8fDE3NjE5ODQ2MDl8MA&ixlib=rb-4.1.0&q=80&w=1080",
    timestamp: "3h ago",
    unread: false,
  },
  {
    id: "4",
    type: "event",
    title: "Speed Dating Event",
    description:
      "Join our virtual speed dating this Saturday at 7 PM",
    timestamp: "1d ago",
    unread: false,
  },
  {
    id: "5",
    type: "match",
    title: "New Match!",
    description: "You matched with Alex Rivera",
    image:
      "https://images.unsplash.com/photo-1604494747044-2e080876c5f1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwb3J0cmFpdCUyMHlvdW5nJTIwcGVyc29ufGVufDF8fHx8MTc2MTkwMTgzMXww&ixlib=rb-4.1.0&q=80&w=1080",
    timestamp: "2d ago",
    unread: false,
  },
];

export function NotificationsView() {
  const getIcon = (type: string) => {
    switch (type) {
      case "match":
        return <Heart className="text-[#DC143C]" size={20} />;
      case "survey":
        return <Video className="text-[#FFD700]" size={20} />;
      case "event":
        return <Calendar className="text-[#FF8C00]" size={20} />;
      default:
        return <Bell className="text-[#8B4513]/60" size={20} />;
    }
  };

  const getBackgroundColor = (type: string) => {
    switch (type) {
      case "match":
        return "from-[#DC143C]/20 to-[#FF8C00]/5";
      case "survey":
        return "from-[#FFD700]/20 to-[#8B4513]/5";
      case "event":
        return "from-[#FF8C00]/20 to-[#8B4513]/5";
      default:
        return "from-white/10 to-white/5";
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-6 pb-4">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-foreground text-3xl">Notifications</h1>
          {mockNotifications.some((n) => n.unread) && (
            <Badge className="bg-gradient-to-r from-[#DC143C] to-[#FF8C00] text-white">
              {mockNotifications.filter((n) => n.unread).length} new
            </Badge>
          )}
        </div>
        <p className="text-muted-foreground">
          Stay updated with your matches and events
        </p>
      </div>

      {/* Notifications list */}
      <div className="flex-1 overflow-auto px-4 pb-4">
        {mockNotifications.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Bell
                size={48}
                className="text-white/20 mx-auto mb-4"
              />
              <p className="text-white/60">
                No notifications yet
              </p>
              <p className="text-white/40 text-sm mt-2">
                We'll notify you about matches and events
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {mockNotifications.map((notification, index) => (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`relative p-4 bg-gradient-to-r ${getBackgroundColor(notification.type)} backdrop-blur-xl border border-white/10 rounded-2xl hover:border-white/20 transition-all cursor-pointer`}
              >
                {notification.unread && (
                  <div className="absolute top-4 right-4 w-3 h-3 bg-[#DC143C] rounded-full shadow-sm" />
                )}

                <div className="flex items-start gap-4">
                  {/* Icon or Image */}
                  <div className="flex-shrink-0">
                    {notification.image ? (
                      <img
                        src={notification.image}
                        alt=""
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-xl flex items-center justify-center border border-white/20">
                        {getIcon(notification.type)}
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="text-foreground font-medium">
                        {notification.title}
                      </h3>
                      <span className="text-muted-foreground text-xs whitespace-nowrap">
                        {notification.timestamp}
                      </span>
                    </div>
                    <p className="text-muted-foreground text-sm">
                      {notification.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}