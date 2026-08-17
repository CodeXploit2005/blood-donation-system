import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Users, ArrowRight, ShieldCheck, Heart, Building2 } from 'lucide-react';
import { formatDate, formatTime } from '../../utils/formatDate';
import { EVENT_STATUS_LABELS, EVENT_STATUS_COLORS } from '../../utils/constants';

export const EventCard = ({ event, index = 0 }) => {
  const [isHovered, setIsHovered] = useState(false);

  const {
    _id,
    title,
    description,
    location,
    addressDetails,
    startDate,
    endDate,
    maxParticipants = 100,
    currentParticipants = 0,
    status = 'open',
    imageUrl,
    organizer,
  } = event;

  const remainingSpots = Math.max(0, maxParticipants - currentParticipants);
  const percentFilled = Math.min(100, Math.round((currentParticipants / maxParticipants) * 100));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative flex flex-col bg-porcelain-card dark:bg-ink-card rounded-3xl border border-sand dark:border-sand/20 shadow-warm hover:shadow-warm-lg transition-all duration-300 overflow-hidden"
    >
      {/* Image Banner with Badges */}
      <div className="relative h-48 w-full overflow-hidden bg-sand-light dark:bg-ink-deep">
        <img
          src={
            imageUrl ||
            'https://images.unsplash.com/photo-1615461066841-6116e61058f4?auto=format&fit=crop&q=80&w=1000'
          }
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          loading="lazy"
        />

        {/* Top Floating Badges (No collision, clean padding) */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none z-10">
          <span className="bg-ink/80 dark:bg-ink-deep/90 text-white backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-mono font-bold shadow-md border border-white/10">
            Còn {remainingSpots} chỗ
          </span>

          <span
            className={`px-3 py-1 text-xs font-bold rounded-full border shadow-md backdrop-blur-md ${
              EVENT_STATUS_COLORS[status] || EVENT_STATUS_COLORS.open
            }`}
          >
            {EVENT_STATUS_LABELS[status] || 'Đang mở'}
          </span>
        </div>
      </div>

      {/* Card Body */}
      <div className="flex-1 p-5 sm:p-6 flex flex-col justify-between space-y-4">
        <div>
          {/* Organizer tag */}
          {organizer && (
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-crimson mb-2">
              <Building2 className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="truncate">{organizer}</span>
            </div>
          )}

          <h3 className="font-display text-lg sm:text-xl font-bold text-ink dark:text-porcelain group-hover:text-crimson transition-colors line-clamp-2 mb-2 leading-snug">
            {title}
          </h3>

          <p className="text-xs text-ink-muted line-clamp-2 mb-4 leading-relaxed">
            {description}
          </p>

          {/* Metadata info */}
          <div className="space-y-2 text-xs text-ink-light mb-4">
            <div className="flex items-start gap-2">
              <Calendar className="w-4 h-4 text-crimson mt-0.5 flex-shrink-0" />
              <div>
                <span className="font-bold text-ink dark:text-porcelain">
                  {formatDate(startDate)} — {formatDate(endDate)}
                </span>
                <span className="text-[11px] text-ink-muted block font-mono">
                  ({formatTime(startDate)} - {formatTime(endDate)})
                </span>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-crimson mt-0.5 flex-shrink-0" />
              <span className="line-clamp-1 text-ink-muted font-medium">{location}</span>
            </div>
          </div>

          {/* Progress bar */}
          <div>
            <div className="flex justify-between text-[11px] font-semibold text-ink-muted mb-1.5">
              <span>Tiến độ đăng ký</span>
              <span className="font-mono text-ink dark:text-porcelain font-bold">
                {currentParticipants} / {maxParticipants} ({percentFilled}%)
              </span>
            </div>
            <div className="w-full h-2 bg-sand-light dark:bg-ink-deep rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-crimson to-crimson-deep rounded-full transition-all duration-500"
                style={{ width: `${percentFilled}%` }}
              />
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-3 border-t border-sand/60 dark:border-sand/20">
          <Link
            to={`/events/${_id}`}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-porcelain dark:bg-ink-deep hover:bg-crimson hover:text-white dark:hover:bg-crimson dark:hover:text-white text-ink dark:text-porcelain text-xs font-bold border border-sand dark:border-sand/20 hover:border-crimson shadow-sm transition-all duration-200"
          >
            <span>{status === 'open' ? 'Đăng ký tham gia' : 'Xem chi tiết'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Signature ECG Heartbeat bottom border pulse animation on hover */}
      <div className="relative h-1.5 w-full bg-sand-light dark:bg-ink-deep overflow-hidden">
        {isHovered && (
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: '100%' }}
            transition={{ duration: 0.6, ease: 'easeInOut' }}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-crimson to-transparent"
          />
        )}
      </div>
    </motion.div>
  );
};

export default EventCard;
