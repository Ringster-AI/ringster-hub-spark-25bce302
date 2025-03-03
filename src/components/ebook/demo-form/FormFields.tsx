
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FormFieldsProps } from "./types";
import { Calendar, User, Building, Briefcase, Users, Phone } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const FormFields = ({ 
  register, 
  errors, 
  watchTeamSize, 
  watchIndustry, 
  handleSelectChange 
}: FormFieldsProps) => {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="fullName">Full Name*</Label>
          <div className="flex items-center border rounded-md bg-white p-2 focus-within:ring-2 focus-within:ring-[#9b87f5]">
            <User className="w-5 h-5 text-gray-400 ml-2" />
            <Input
              id="fullName"
              {...register("fullName", { required: "Name is required" })}
              placeholder="Your full name"
              className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>
          {errors.fullName && (
            <p className="text-red-500 text-sm">{errors.fullName.message}</p>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="email">Email Address*</Label>
          <div className="flex items-center border rounded-md bg-white p-2 focus-within:ring-2 focus-within:ring-[#9b87f5]">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-400 ml-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
              <polyline points="22,6 12,13 2,6"></polyline>
            </svg>
            <Input
              id="email"
              type="email"
              {...register("email", { required: "Email is required" })}
              placeholder="Your email address"
              className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>
          {errors.email && (
            <p className="text-red-500 text-sm">{errors.email.message}</p>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number*</Label>
          <div className="flex items-center border rounded-md bg-white p-2 focus-within:ring-2 focus-within:ring-[#9b87f5]">
            <Phone className="w-5 h-5 text-gray-400 ml-2" />
            <Input
              id="phone"
              type="tel"
              {...register("phone", { required: "Phone number is required" })}
              placeholder="Your phone number"
              className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>
          {errors.phone && (
            <p className="text-red-500 text-sm">{errors.phone.message}</p>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="companyName">Company Name*</Label>
          <div className="flex items-center border rounded-md bg-white p-2 focus-within:ring-2 focus-within:ring-[#9b87f5]">
            <Building className="w-5 h-5 text-gray-400 ml-2" />
            <Input
              id="companyName"
              {...register("companyName", { required: "Company name is required" })}
              placeholder="Your company name"
              className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>
          {errors.companyName && (
            <p className="text-red-500 text-sm">{errors.companyName.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="jobTitle">Job Title*</Label>
          <div className="flex items-center border rounded-md bg-white p-2 focus-within:ring-2 focus-within:ring-[#9b87f5]">
            <Briefcase className="w-5 h-5 text-gray-400 ml-2" />
            <Input
              id="jobTitle"
              {...register("jobTitle", { required: "Job title is required" })}
              placeholder="Your job title"
              className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>
          {errors.jobTitle && (
            <p className="text-red-500 text-sm">{errors.jobTitle.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="industry">Industry*</Label>
          <Select
            value={watchIndustry}
            onValueChange={(value) => handleSelectChange("industry", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select your industry" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="technology">Technology</SelectItem>
              <SelectItem value="healthcare">Healthcare</SelectItem>
              <SelectItem value="finance">Finance</SelectItem>
              <SelectItem value="education">Education</SelectItem>
              <SelectItem value="retail">Retail</SelectItem>
              <SelectItem value="manufacturing">Manufacturing</SelectItem>
              <SelectItem value="hospitality">Hospitality</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
          <input 
            type="hidden" 
            {...register("industry", { required: "Industry is required" })} 
          />
          {errors.industry && (
            <p className="text-red-500 text-sm">{errors.industry.message}</p>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="teamSize">Team Size*</Label>
          <Select
            value={watchTeamSize}
            onValueChange={(value) => handleSelectChange("teamSize", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select team size" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1-10">1-10 employees</SelectItem>
              <SelectItem value="11-50">11-50 employees</SelectItem>
              <SelectItem value="51-200">51-200 employees</SelectItem>
              <SelectItem value="201-500">201-500 employees</SelectItem>
              <SelectItem value="501+">501+ employees</SelectItem>
            </SelectContent>
          </Select>
          <input 
            type="hidden" 
            {...register("teamSize", { required: "Team size is required" })} 
          />
          {errors.teamSize && (
            <p className="text-red-500 text-sm">{errors.teamSize.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="preferredDate">Preferred Demo Date</Label>
          <div className="flex items-center border rounded-md bg-white p-2 focus-within:ring-2 focus-within:ring-[#9b87f5]">
            <Calendar className="w-5 h-5 text-gray-400 ml-2" />
            <Input
              id="preferredDate"
              type="date"
              {...register("preferredDate")}
              className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="message">How can we help your business?</Label>
        <Textarea
          id="message"
          {...register("message")}
          placeholder="Tell us about your business needs and goals"
          className="min-h-[100px]"
        />
      </div>
    </>
  );
};
