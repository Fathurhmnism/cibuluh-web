import React from 'react';
import { Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-[#C9A875] text-[#1C3B28] py-12 px-6">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold mb-4">Get in Touch</h2>
        <p className="text-white text-base mb-8">
          For business and partnership inquiry please contact me below!
        </p>

        <div className="space-y-6 text-sm md:text-base">
          <div className="flex items-start gap-4">
            <Phone className="mt-1" />
            <div>
              <p className="font-semibold">Phone</p>
              <p>0899-3415-875</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <Mail className="mt-1" />
            <div>
              <p className="font-semibold">Email</p>
              <p>cibuluberdaya@gmail.com</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <MapPin className="mt-1" />
            <div>
              <p className="font-semibold">Address</p>
              <p>Signature Park Grande Apartement,Jakarta,Indonesia</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
