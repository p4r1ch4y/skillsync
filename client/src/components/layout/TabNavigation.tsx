import { Link, useLocation } from "wouter";

interface TabNavigationProps {
  candidateUrl: string;
  companyUrl: string;
}

const TabNavigation = ({ candidateUrl, companyUrl }: TabNavigationProps) => {
  const [location, setLocation] = useLocation();
  
  const isCandidate = location === candidateUrl;
  const isCompany = location === companyUrl;
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <Link href={candidateUrl}>
            <a 
              className={`${
                isCandidate
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Candidate View
            </a>
          </Link>
          <Link href={companyUrl}>
            <a 
              className={`${
                isCompany
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Company View
            </a>
          </Link>
        </nav>
      </div>
    </div>
  );
};

export default TabNavigation;
