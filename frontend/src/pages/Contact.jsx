import React, { useState } from 'react';
import FormInput from '../components/FormInput';
import Button from '../components/Button';
import { Send, MapPin, Phone, Mail } from 'lucide-react';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    // Simulate contact form submission
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
    }, 1000);
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-16">
      <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-6 text-center">Contact Us</h1>
      <p className="text-slate-600 dark:text-slate-300 text-center text-lg max-w-2xl mx-auto mb-16 leading-relaxed">
        Have questions about ResqFood Link? Get in touch with our team.
      </p>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="space-y-6">
          <div className="glass-card p-6 rounded-xl border border-slate-200 dark:border-dark-border flex gap-4 items-center">
            <div className="p-3 bg-brand-green-50 dark:bg-brand-green-500/10 text-brand-green-500 rounded-lg">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-slate-800 dark:text-white text-sm">Location</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">123 Eco Avenue, Green City</p>
            </div>
          </div>

          <div className="glass-card p-6 rounded-xl border border-slate-200 dark:border-dark-border flex gap-4 items-center">
            <div className="p-3 bg-brand-orange-50 dark:bg-brand-orange-500/10 text-brand-orange-500 rounded-lg">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-slate-800 dark:text-white text-sm">Phone</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">+1 (555) 0199</p>
            </div>
          </div>

          <div className="glass-card p-6 rounded-xl border border-slate-200 dark:border-dark-border flex gap-4 items-center">
            <div className="p-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-slate-800 dark:text-white text-sm">Email</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">support@resqfoodlink.org</p>
            </div>
          </div>
        </div>

        <div className="md:col-span-2 glass-card p-8 rounded-xl border border-slate-200 dark:border-dark-border shadow-sm">
          {submitted ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-brand-green-100 text-brand-green-600 dark:bg-brand-green-500/10 dark:text-brand-green-500 flex items-center justify-center rounded-full mx-auto mb-6">
                <Send className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold text-slate-800 dark:text-white">Message Sent!</h3>
              <p className="text-slate-600 dark:text-slate-300 mt-2 max-w-sm mx-auto text-sm">
                Thank you for reaching out. A support representative will get back to you shortly.
              </p>
              <Button 
                variant="outline" 
                onClick={() => setSubmitted(false)}
                className="mt-6"
              >
                Send Another Message
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <FormInput
                  label="Name"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Your Name"
                  required
                />
                <FormInput
                  label="Email"
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@example.com"
                  required
                />
              </div>

              <FormInput
                label="Subject"
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                placeholder="How can we help you?"
                required
              />

              <div className="flex flex-col gap-1.5 w-full">
                <label htmlFor="message" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Message <span className="text-brand-orange-500">*</span>
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows="4"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Your Message..."
                  required
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-dark-border bg-white dark:bg-dark-card text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-green-500 focus:border-brand-green-500 transition-all"
                />
              </div>

              <div className="flex justify-end">
                <Button 
                  type="submit" 
                  disabled={loading}
                  className="flex items-center gap-2"
                >
                  {loading ? 'Sending...' : 'Send Message'}
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
