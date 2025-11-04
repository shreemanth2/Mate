import { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";
import {
  Camera,
  MapPin,
  Calendar,
  Tag,
  User,
  Heart,
} from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { toast } from "sonner";

const availableTags = [
  "Travel",
  "Music",
  "Art",
  "Fitness",
  "Food",
  "Gaming",
  "Reading",
  "Photography",
  "Dancing",
  "Sports",
  "Movies",
  "Nature",
];

const lgbtqiaOrientations = [
  "Gay",
  "Lesbian",
  "Bisexual",
  "Pansexual",
  "Asexual",
  "Queer",
  "Non-binary",
  "Transgender",
  "Gender Fluid",
  "Other",
];

interface ProfileSetupProps {
  onComplete: (profileData: any) => void;
}

export function ProfileSetup({
  onComplete,
}: ProfileSetupProps) {
  const [step, setStep] = useState<"loading" | "form">(
    "loading",
  );
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [locationQuery, setLocationQuery] = useState("");
  const [locationSuggestions, setLocationSuggestions] = useState<any[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<null | {display_name:string, lat:string, lon:string}>(null);
  const [isLocLoading, setIsLocLoading] = useState(false);
  const searchAbortRef = useRef<AbortController | null>(null);
  const debounceRef = useRef<number | null>(null);
  const [birthdate, setBirthdate] = useState("");
  const [gender, setGender] = useState("");
  const [orientation, setOrientation] = useState("");
  const [preferences, setPreferences] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>(
    [],
  );
  const [imagePreview, setImagePreview] = useState<
    string | null
  >(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setStep("form");
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  const handleImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const togglePreference = (pref: string) => {
    if (preferences.includes(pref)) {
      setPreferences(preferences.filter((p) => p !== pref));
    } else {
      setPreferences([...preferences, pref]);
    }
  };

  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birth.getDate())
    ) {
      age--;
    }
    return age;
  };

  const handleBirthdateChange = (value: string) => {
    setBirthdate(value);
    if (value) {
      const age = calculateAge(value);
      if (age < 18) {
        toast.error("Minimum age is 18 years old", {
          description: "Please enter a valid birthdate",
        });
      }
    }
  };

  const handleSubmit = () => {
    const age = calculateAge(birthdate);
    if (age < 18) {
      toast.error(
        "You must be at least 18 years old to create a profile",
      );
      return;
    }

    const profileData = {
      name,
      location,
      locationCoordinates: selectedLocation
        ? { lat: selectedLocation.lat, lon: selectedLocation.lon }
        : null,
      birthdate,
      gender,
      orientation,
      preferences,
      tags: selectedTags,
      image: imagePreview,
      aiDescription: `Meet ${name}, a vibrant soul who loves ${selectedTags
        .slice(0, 2)
        .join(" and ")}. Based in ${location}, they're looking for meaningful connections and exciting adventures. Their passion for life shines through in everything they do.`,
    };
    onComplete(profileData);
  };

  // Fetch location suggestions from OpenStreetMap Nominatim with debounce
  useEffect(() => {
    if (!locationQuery || locationQuery.length < 3) {
      setLocationSuggestions([]);
      return;
    }

    if (debounceRef.current) {
      window.clearTimeout(debounceRef.current);
    }

    debounceRef.current = window.setTimeout(async () => {
      try {
        if (searchAbortRef.current) {
          searchAbortRef.current.abort();
        }
        const ac = new AbortController();
        searchAbortRef.current = ac;

        const url = `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&q=${encodeURIComponent(
          locationQuery,
        )}&limit=6`;
        const res = await fetch(url, {
          signal: ac.signal,
          headers: {
            // Nominatim requests a valid User-Agent identifying the application
            "Accept": "application/json",
            "User-Agent": "MateApp/1.0 (dev@yourdomain.com)",
          },
        });
        if (!res.ok) return;
        const data = await res.json();
        setLocationSuggestions(data || []);
      } catch (err) {
        if ((err as any)?.name === "AbortError") return;
        // otherwise ignore errors silently for now
      }
    }, 300);

    return () => {
      if (debounceRef.current) {
        window.clearTimeout(debounceRef.current);
      }
      if (searchAbortRef.current) {
        searchAbortRef.current.abort();
      }
    };
  }, [locationQuery]);

  // Attempt to autofill location via browser geolocation + reverse geocoding
  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }
    setIsLocLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;
          const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1`;
          const res = await fetch(url);
          if (!res.ok) {
            toast.error('Failed to lookup your location');
            setIsLocLoading(false);
            return;
          }
          const data = await res.json();
          const display_name = data.display_name || `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
          setLocationQuery(display_name);
          setSelectedLocation({ display_name, lat: String(lat), lon: String(lon) });
          setLocation(display_name);
          setLocationSuggestions([]);
          toast.success('Location autofilled');
        } catch (err) {
          toast.error('Could not determine your location');
        } finally {
          setIsLocLoading(false);
        }
      },
      (err) => {
        setIsLocLoading(false);
        toast.error('Location permission denied or unavailable');
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  if (step === "loading") {
    return (
      <div className="h-screen w-full bg-gradient-to-br from-[#FFFBF0] to-[#FFF4E6] flex flex-col items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0">
          <motion.div
            className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#DC143C]/20 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 0, 0],
            }}
            transition={{ duration: 4, repeat: Infinity }}
          />
          <motion.div
            className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#FF8C00]/20 rounded-full blur-3xl"
            animate={{
              scale: [1.2, 1, 1.2],
              rotate: [360, 180, 0],
            }}
            transition={{ duration: 4, repeat: Infinity }}
          />
        </div>

        <div className="relative z-10 text-center">
          <motion.div
            className="relative w-32 h-32 mx-auto mb-12"
            animate={{ rotate: 360 }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            <div className="absolute inset-0 border-4 border-[#DC143C] border-t-transparent rounded-full" />
            <div className="absolute inset-2 border-4 border-[#FF8C00] border-b-transparent rounded-full" />
            <div className="absolute inset-4 border-4 border-[#8B4513] border-l-transparent rounded-full" />
          </motion.div>

          <motion.h2
            className="text-primary text-4xl mb-4"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            Creating your AI profile...
          </motion.h2>
          <p className="text-muted-foreground text-xl">
            Just a few more steps!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-gradient-to-br from-[#FFFBF0] to-[#FFF4E6] overflow-auto">
      <div className="min-h-screen flex items-center justify-center p-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-6xl"
        >
          <h1 className="text-primary text-5xl mb-3">
            Complete Your Profile
          </h1>
          <p className="text-muted-foreground text-xl mb-12">
            Tell us a bit about yourself
          </p>

          {/* Bento Grid Layout */}
          <div className="grid grid-cols-3 gap-6">
            {/* Left Column - Photo */}
            <div className="col-span-1">
              <div className="bg-white rounded-3xl p-8 shadow-lg border border-[#8B4513]/10 sticky top-6">
                <label className="relative cursor-pointer group block">
                  <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-[#FFF4E6] flex items-center justify-center">
                    {imagePreview ? (
                      <img
                        src={imagePreview}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-center">
                        <Camera className="w-20 h-20 text-[#8B4513]/40 group-hover:text-[#8B4513]/60 transition-colors mx-auto mb-4" />
                        <p className="text-muted-foreground">
                          Click to upload photo
                        </p>
                      </div>
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <div className="absolute inset-0 rounded-2xl border-2 border-[#DC143C]/0 group-hover:border-[#DC143C]/50 transition-all" />
                </label>
              </div>
            </div>

            {/* Right Column - Form */}
            <div className="col-span-2 space-y-6">
              {/* Basic Info Card */}
              <div className="bg-white rounded-3xl p-8 shadow-lg border border-[#8B4513]/10">
                <h3 className="text-2xl text-primary mb-6 flex items-center gap-3">
                  <User className="text-[#DC143C]" />
                  Basic Information
                </h3>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="text-primary flex items-center gap-2">
                      <Tag
                        size={20}
                        className="text-[#DC143C]"
                      />
                      Name
                    </label>
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter your name"
                      className="bg-[#FFF8E7] border-[#8B4513]/20 text-primary placeholder:text-muted-foreground h-12 text-lg rounded-xl"
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="text-primary flex items-center gap-2">
                      <MapPin
                        size={20}
                        className="text-[#DC143C]"
                      />
                      Location
                    </label>
                    <div className="relative">
                      <Input
                        value={locationQuery}
                        onChange={(e) => {
                          setLocationQuery(e.target.value);
                          setSelectedLocation(null);
                        }}
                        placeholder="City, State/Country"
                        className="bg-[#FFF8E7] border-[#8B4513]/20 text-primary placeholder:text-muted-foreground h-12 text-lg rounded-xl"
                        aria-autocomplete="list"
                        aria-expanded={locationSuggestions.length > 0}
                        aria-haspopup="listbox"
                      />
                      <div className="absolute top-0 right-0 h-full flex items-center pr-2">
                        <button onClick={handleUseMyLocation} className="text-sm px-3 py-2 rounded-md bg-white border border-[#8B4513]/10 hover:bg-[#FFF4E6] transition-colors" type="button">
                          {isLocLoading ? 'Locating...' : 'Use my location'}
                        </button>
                      </div>

                      {locationSuggestions.length > 0 && (
                        <ul
                          role="listbox"
                          className="absolute z-20 left-0 right-0 mt-2 bg-white border rounded-lg shadow-lg max-h-56 overflow-auto"
                        >
                          {locationSuggestions.map((s, idx) => (
                            <li
                              key={s.place_id ?? idx}
                              role="option"
                              onMouseDown={() => {
                                // onMouseDown to prevent blur before click
                                setLocationQuery(s.display_name);
                                setSelectedLocation({
                                  display_name: s.display_name,
                                  lat: s.lat,
                                  lon: s.lon,
                                });
                                setLocation(s.display_name);
                                setLocationSuggestions([]);
                              }}
                              className="px-4 py-2 hover:bg-[#FFF4E6] cursor-pointer text-sm"
                            >
                              {s.display_name}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3 col-span-2">
                    <label className="text-primary flex items-center gap-2">
                      <Calendar
                        size={20}
                        className="text-[#DC143C]"
                      />
                      Birthdate
                    </label>
                    <Input
                      type="date"
                      value={birthdate}
                      onChange={(e) =>
                        handleBirthdateChange(e.target.value)
                      }
                      max={
                        new Date(
                          new Date().setFullYear(
                            new Date().getFullYear() - 18,
                          ),
                        )
                          .toISOString()
                          .split("T")[0]
                      }
                      className="bg-[#FFF8E7] border-[#8B4513]/20 text-primary h-12 text-lg rounded-xl"
                    />
                  </div>
                </div>
              </div>

              {/* Gender & Preferences Card */}
              <div className="bg-white rounded-3xl p-8 shadow-lg border border-[#8B4513]/10">
                <h3 className="text-2xl text-primary mb-6 flex items-center gap-3">
                  <Heart className="text-[#DC143C]" />
                  Gender & Preferences
                </h3>

                <div className="space-y-6">
                  <div className="space-y-3">
                    <label className="text-primary">
                      Gender
                    </label>
                    <div className="grid grid-cols-3 gap-4">
                      {["Male", "Female", "LGBTQIA+"].map(
                        (g) => (
                          <Badge
                            key={g}
                            onClick={() => setGender(g)}
                            className={`cursor-pointer transition-all justify-center py-4 text-base ${
                              gender === g
                                ? "bg-gradient-to-r from-[#DC143C] to-[#FF8C00] text-white"
                                : "bg-[#FFF4E6] text-primary hover:bg-[#FFE4B5]"
                            }`}
                          >
                            {g}
                          </Badge>
                        ),
                      )}
                    </div>
                  </div>

                  {gender === "LGBTQIA+" && (
                    <div className="space-y-3">
                      <label className="text-primary">
                        Orientation
                      </label>
                      <div className="flex flex-wrap gap-3">
                        {lgbtqiaOrientations.map((o) => (
                          <Badge
                            key={o}
                            onClick={() => setOrientation(o)}
                            className={`cursor-pointer transition-all text-base ${
                              orientation === o
                                ? "bg-gradient-to-r from-[#DC143C] to-[#FF8C00] text-white"
                                : "bg-[#FFF4E6] text-primary hover:bg-[#FFE4B5]"
                            }`}
                          >
                            {o}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="space-y-3">
                    <label className="text-primary">
                      Looking for
                    </label>
                    <div className="grid grid-cols-3 gap-4">
                      {["Male", "Female", "LGBTQIA+"].map(
                        (pref) => (
                          <Badge
                            key={pref}
                            onClick={() =>
                              togglePreference(pref)
                            }
                            className={`cursor-pointer transition-all justify-center py-4 text-base ${
                              preferences.includes(pref)
                                ? "bg-gradient-to-r from-[#DC143C] to-[#FF8C00] text-white"
                                : "bg-[#FFF4E6] text-primary hover:bg-[#FFE4B5]"
                            }`}
                          >
                            {pref}
                          </Badge>
                        ),
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Interests Card */}
              <div className="bg-white rounded-3xl p-8 shadow-lg border border-[#8B4513]/10">
                <h3 className="text-2xl text-primary mb-6">
                  Interests
                </h3>
                <div className="flex flex-wrap gap-3">
                  {availableTags.map((tag) => (
                    <Badge
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={`cursor-pointer transition-all text-base px-5 py-3 ${
                        selectedTags.includes(tag)
                          ? "bg-gradient-to-r from-[#DC143C] to-[#FF8C00] text-white"
                          : "bg-[#FFF4E6] text-primary hover:bg-[#FFE4B5]"
                      }`}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <Button
                onClick={handleSubmit}
                disabled={
                  !name ||
                  !location ||
                  !birthdate ||
                  !gender ||
                  preferences.length === 0 ||
                  selectedTags.length === 0 ||
                  !imagePreview ||
                  (gender === "LGBTQIA+" && !orientation) ||
                  (birthdate && calculateAge(birthdate) < 18)
                }
                className="w-full bg-gradient-to-r from-[#DC143C] to-[#FF8C00] hover:from-[#B22222] hover:to-[#FF7F00] text-white py-8 rounded-2xl disabled:opacity-50 text-xl shadow-lg"
              >
                Create Profile
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}