"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Users, User, Instagram, Facebook, Twitter, Bike, CheckCircle, Car, SortAsc } from "lucide-react"
import { toast } from "sonner"

/**
 * Registration Form Validation Schemas
 *
 * These schemas ensure data integrity and provide user feedback
 * for both individual and club registration forms.
 */
const clubSchema = z.object({
  type: z.literal("club"),
  clubName: z.string().min(2, "Club name must be at least 2 characters"),
  adminName: z.string().min(2, "Admin name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  country: z.string().min(1, "Country is required"),
  city: z.string().min(1, "City is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  licenceNumber: z.string().min(1, "Licence number is required"),
  website: z.string().optional(),
  instagram: z.string().optional(),
  facebook: z.string().optional(),
  twitter: z.string().optional(),
  acceptTerms: z.boolean().refine((val) => val === true, {
    message: "You must accept the terms and conditions",
  }),
})

const individualSchema = z.object({
  type: z.literal("individual"),
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  country: z.string().min(1, "Country is required"),
  city: z.string().min(1, "City is required"),
  bio: z.string().min(10, "Bio must be at least 10 characters"),
  ridingExperience: z.string().min(1, "Riding experience is required"),
  licenceNumber: z.string().min(1, "Licence number is required"),
  instagram: z.string().optional(),
  facebook: z.string().optional(),
  twitter: z.string().optional(),
  acceptTerms: z.boolean().refine((val) => val === true, {
    message: "You must accept the terms and conditions",
  }),
})

type ClubFormData = z.infer<typeof clubSchema>
type IndividualFormData = z.infer<typeof individualSchema>
type FormData = ClubFormData | IndividualFormData

const countries: string[] = [
  "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina",
  "Armenia", "Australia", "Austria", "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados",
  "Belarus", "Belgium", "Belize", "Benin", "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana",
  "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Cabo Verde", "Cambodia", "Cameroon",
  "Canada", "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros",
  "Congo (Congo-Brazzaville)", "Costa Rica", "Croatia", "Cuba", "Cyprus", "Czechia",
  "Democratic Republic of the Congo", "Denmark", "Djibouti", "Dominica", "Dominican Republic",
  "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini",
  "Ethiopia", "Fiji", "Finland", "France", "Gabon", "Gambia", "Georgia", "Germany", "Ghana",
  "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana", "Haiti", "Honduras",
  "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy",
  "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Kuwait", "Kyrgyzstan",
  "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania",
  "Luxembourg", "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands",
  "Mauritania", "Mauritius", "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia",
  "Montenegro", "Morocco", "Mozambique", "Myanmar", "Namibia", "Nauru", "Nepal", "Netherlands",
  "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Korea", "North Macedonia", "Norway",
  "Oman", "Pakistan", "Palau", "Palestine", "Panama", "Papua New Guinea", "Paraguay", "Peru",
  "Philippines", "Poland", "Portugal", "Qatar", "Romania", "Russia", "Rwanda", "Saint Kitts and Nevis",
  "Saint Lucia", "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe",
  "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia",
  "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Korea", "South Sudan", "Spain",
  "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", "Syria", "Taiwan", "Tajikistan",
  "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia",
  "Turkey", "Turkmenistan", "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates",
  "United Kingdom", "United States", "Uruguay", "Uzbekistan", "Vanuatu", "Vatican City",
  "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe"
];
const sortedCountries = [...countries].sort((a, b) => a.localeCompare(b))

export default function RegisterPage() {
  const [registrationType, setRegistrationType] = useState<"club" | "individual">("individual")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const schema = registrationType === "club" ? clubSchema : individualSchema

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const acceptTerms = watch("acceptTerms")

  /**
   * Submit Registration using the current API
   *
   * This function sends registration data to the API endpoint from route.ts
   * which handles validation and saves to Google Sheets.
   */
  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true)
    try {
      // Send POST request to the registration API
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Registration failed')
      }

      setIsSubmitted(true)
      toast.success(result.message || "Registration successful! Welcome to Save Earth Ride community.")

      // Reset form for potential new registration
      reset()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Registration failed. Please try again.")
      console.error("Registration error:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleTypeChange = (value: string) => {
    const newType = value as "club" | "individual"
    setRegistrationType(newType)
    reset()
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-background py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <Card className="border-0 shadow-xl">
              <CardContent className="p-12">
                <div className="flex items-center justify-center space-x-3 mb-6">
                  <CheckCircle className="h-16 w-16 text-green-500" />
                  {/* <Bike className="h-12 w-12 text-blue-500 animate-bounce" /> */}
                </div>
                <h1 className="text-3xl font-bold text-foreground mb-4">Registration Successful!</h1>
                <p className="text-xl text-muted-foreground mb-8">
                  Welcome to the Save Earth Ride community! You're now part of a global movement of riders making a
                  difference.
                </p>
                <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg mb-8">
                  <h3 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-2">What's Next?</h3>
                  <ul className="text-green-700 dark:text-green-300 space-y-2 text-left">
                    <li>• Check your email for a welcome message with community guidelines</li>
                    <li>• Join our upcoming rides and tree planting events</li>
                    <li>• Connect with fellow riders in your area</li>
                    <li>• Start making a positive environmental impact</li>
                  </ul>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button onClick={() => (window.location.href = "/")} size="lg">
                    <Bike className="h-5 w-5 mr-2" />
                    Explore Community
                  </Button>
                  <Button variant="outline" onClick={() => (window.location.href = "/gallery")} size="lg">
                    View Gallery
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center space-x-3 mb-4">
              {/* <Bike className="h-10 w-10 text-primary animate-bounce" /> */}
              <Users className="h-8 w-8 text-blue-600" />
            </div>
            <h1 className="text-4xl font-bold text-foreground mb-4">Join Our Community</h1>
            <p className="text-xl text-muted-foreground">
              Register as an individual rider or motorcycle club to be part of our global environmental movement.
            </p>
          </div>

          <Card className="border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-primary" />
                <span>Registration Form</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Registration Type */}
              <div className="space-y-4">
                <Label className="text-base font-medium">Registration Type</Label>
                <RadioGroup value={registrationType} onValueChange={handleTypeChange} className="flex space-x-6">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="individual" id="individual" />
                    <Label htmlFor="individual" className="flex items-center space-x-2 cursor-pointer">
                      <User className="h-4 w-4" />
                      <span>Individual Rider</span>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="club" id="club" />
                    <Label htmlFor="club" className="flex items-center space-x-2 cursor-pointer">
                      <Users className="h-4 w-4" />
                      <span>Motorcycle Club</span>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Individual Form */}
                {registrationType === "individual" && (
                  <>
                    <input type="hidden" {...register("type")} value="individual" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name *</Label>
                        <Input
                          id="firstName"
                          {...register("firstName")}
                          placeholder="Enter your first name"
                          className="bg-background"
                        />
                        {errors && "firstName" in errors && errors.firstName && (
                          <p className="text-sm text-red-500">{errors.firstName.message}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name *</Label>
                        <Input
                          id="lastName"
                          {...register("lastName")}
                          placeholder="Enter your last name"
                          className="bg-background"
                        />
                        {errors && "lastName" in errors && errors.lastName && (
                          <p className="text-sm text-red-500">{errors.lastName.message}</p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="ridingExperience">Riding Experience *</Label>
                      <Select onValueChange={(value) => setValue("ridingExperience", value)}>
                        <SelectTrigger className="bg-background">
                          <SelectValue placeholder="Select your riding experience" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="beginner">Beginner (0-2 years)</SelectItem>
                          <SelectItem value="intermediate">Intermediate (3-5 years)</SelectItem>
                          <SelectItem value="experienced">Experienced (6-10 years)</SelectItem>
                          <SelectItem value="expert">Expert (10+ years)</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors && "ridingExperience" in errors && errors.ridingExperience && (
                        <p className="text-sm text-red-500">{errors.ridingExperience.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bio">Personal Bio *</Label>
                      <Textarea
                        id="bio"
                        {...register("bio")}
                        placeholder="Tell us about yourself, your passion for riding, and environmental interests..."
                        rows={4}
                        className="bg-background"
                      />
                      {errors && "bio" in errors && errors.bio && (
                        <p className="text-sm text-red-500">{errors.bio.message}</p>
                      )}
                    </div>
                  </>
                )}

                {/* Club Form */}
                {registrationType === "club" && (
                  <>
                    <input type="hidden" {...register("type")} value="club" />
                    <div className="space-y-2">
                      <Label htmlFor="clubName">Club Name *</Label>
                      <Input
                        id="clubName"
                        {...register("clubName")}
                        placeholder="Enter your club name"
                        className="bg-background"
                      />
                      {errors && "clubName" in errors && errors.clubName && (
                        <p className="text-sm text-red-500">{errors.clubName.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="adminName">Admin/Contact Person Name *</Label>
                      <Input
                        id="adminName"
                        {...register("adminName")}
                        placeholder="Enter admin name"
                        className="bg-background"
                      />
                      {errors && "adminName" in errors && errors.adminName && (
                        <p className="text-sm text-red-500">{errors.adminName.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Club Description *</Label>
                      <Textarea
                        id="description"
                        {...register("description")}
                        placeholder="Describe your club, its mission, and environmental initiatives..."
                        rows={4}
                        className="bg-background"
                      />
                      {errors && "description" in errors && errors.description && (
                        <p className="text-sm text-red-500">{errors.description.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="website">Website (Optional)</Label>
                      <Input
                        id="website"
                        {...register("website")}
                        placeholder="https://yourclub.com"
                        className="bg-background"
                      />
                    </div>
                  </>
                )}

                {/* Common Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      {...register("email")}
                      placeholder="Enter your email"
                      className="bg-background"
                    />
                    {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      {...register("phone")}
                      placeholder="Enter your phone number"
                      className="bg-background"
                      maxLength={10}
                    />
                    {errors.phone && <p className="text-sm text-red-500">{errors.phone.message}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="country">Country *</Label>
                    <Select onValueChange={(value) => setValue("country", value)}>
                      <SelectTrigger className="bg-background">
                        <SelectValue placeholder="Select your country" />
                      </SelectTrigger>
                      <SelectContent>
                        {sortedCountries.map((country) => (
                          <SelectItem key={country} value={country}>
                            {country}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.country && <p className="text-sm text-red-500">{errors.country.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">City *</Label>
                    <Input id="city" {...register("city")} placeholder="Enter your city" className="bg-background" />
                    {errors.city && <p className="text-sm text-red-500">{errors.city.message}</p>}
                  </div>
                </div>

                {/* Licence Number */}
                <div className="space-y-2">
                  <Label htmlFor="licenceNumber" className="flex items-center space-x-2">
                    <Car className="h-4 w-4" />
                    <span>Licence Number *</span>
                  </Label>
                  <Input
                    id="licenceNumber"
                    {...register("licenceNumber")}
                    placeholder="Enter your licence number"
                    className="bg-background"
                  />
                  {errors.licenceNumber && (
                    <p className="text-sm text-red-500">{errors.licenceNumber.message}</p>
                  )}
                </div>

                {/* Social Media */}
                <div className="space-y-4">
                  <Label className="text-base font-medium">Social Media (Optional)</Label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="instagram" className="flex items-center space-x-2">
                        <Instagram className="h-4 w-4" />
                        <span>Instagram</span>
                      </Label>
                      <Input
                        id="instagram"
                        {...register("instagram")}
                        placeholder="@username"
                        className="bg-background"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="facebook" className="flex items-center space-x-2">
                        <Facebook className="h-4 w-4" />
                        <span>Facebook</span>
                      </Label>
                      <Input
                        id="facebook"
                        {...register("facebook")}
                        placeholder="Facebook profile/page"
                        className="bg-background"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="twitter" className="flex items-center space-x-2">
                        <Twitter className="h-4 w-4" />
                        <span>Twitter</span>
                      </Label>
                      <Input id="twitter" {...register("twitter")} placeholder="@username" className="bg-background" />
                    </div>
                  </div>
                </div>

                {/* Terms and Conditions */}
                <div className="space-y-4">
                  <Label className="text-base font-medium">Terms and Conditions</Label>
                  <div className="bg-muted/50 p-4 rounded-lg border max-h-64 overflow-y-auto">
                    <div className="text-sm text-muted-foreground space-y-3 leading-relaxed">
                      <p>
                        <strong>1)</strong> In recognition of the inherent risks of the activity in which I will engage,
                        I confirm that I am physically and mentally capable of participating in the activity. My
                        participation is voluntary and I will assume financial responsibility for personal injury,
                        accidents and damage to or loss of personal property as the result of any incident or accident
                        that may occur.
                      </p>
                      <p>
                        <strong>2)</strong> If the behaviour of any Rider/Pillion is likely to cause distress or harm to
                        themselves, our member of staff or other team members, our local Guide/Staff reserve the right
                        to terminate their trip at any time and they will have to make their own arrangements; we will
                        not be liable for any expenses incurred as a result. We will not entertain any claims arising
                        due to such action.
                      </p>
                      <p>
                        <strong>3)</strong> In case of any injuries/illness during a trip/activity, BCI as a community
                        or our members, the admin will not be responsible. We provide adequate human support on the ride
                        to ensure the basic safety of the rider. The rider has to bear all the expenses which may arise
                        in case for a medical emergency condition.
                      </p>
                      <p>
                        <strong>4)</strong> We do not promote any stunt and drink and drive, so please refrain yourself
                        from such activities.
                      </p>
                      <p>
                        <strong>5)</strong> Following Covid19 guidelines given by concerned authorities.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="acceptTerms"
                      checked={acceptTerms || false}
                      onCheckedChange={(checked) => setValue("acceptTerms", checked as boolean)}
                    />
                    <Label htmlFor="acceptTerms" className="text-sm font-medium cursor-pointer">
                      I Accept the terms and conditions *
                    </Label>
                  </div>
                  {errors.acceptTerms && <p className="text-sm text-red-500">{errors.acceptTerms.message}</p>}
                </div>

                <Button type="submit" className="w-full" size="lg" disabled={isSubmitting || !acceptTerms}>
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Bike className="h-5 w-5 mr-2" />
                      Complete Registration
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}