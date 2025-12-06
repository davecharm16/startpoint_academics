import Link from "next/link";

export function PublicFooter() {
  return (
    <footer className="border-t bg-muted/50">
      <div className="container py-8 md:py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* Brand */}
          <div>
            <h3 className="text-lg font-bold text-primary">
              Startpoint Academics
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Professional academic writing services with transparent pricing
              and real-time project tracking.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-foreground">
              Quick Links
            </h4>
            <ul className="mt-3 space-y-2">
              <li>
                <Link
                  href="#services"
                  className="text-sm text-muted-foreground hover:text-primary"
                >
                  Services
                </Link>
              </li>
              <li>
                <Link
                  href="#packages"
                  className="text-sm text-muted-foreground hover:text-primary"
                >
                  Packages
                </Link>
              </li>
              <li>
                <Link
                  href="#about"
                  className="text-sm text-muted-foreground hover:text-primary"
                >
                  About Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-semibold text-foreground">Contact</h4>
            <ul className="mt-3 space-y-2">
              <li className="text-sm text-muted-foreground">
                Email: support@startpointacademics.com
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
          <p>
            &copy; {new Date().getFullYear()} Startpoint Academics. All rights
            reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
