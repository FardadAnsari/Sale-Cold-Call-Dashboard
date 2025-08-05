// src/pages/Leads.jsx
import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import Pagination from '../components/Pagination';
import LeadsTable from '../components/LeadsTable';
import { API_BASE_URL } from '../api';
import Search from '../components/Search';
import LeadDrawer from '../components/LeadDrawer';

const ITEMS_PER_PAGE = 15;

const Leads = () => {
  const isDarkMode = true;
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedLeadId, setSelectedLeadId] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const authToken = sessionStorage.getItem('authToken');

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const {
    data: leads,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['leads'],
    queryFn: async () => {
      const response = await axios.get(`${API_BASE_URL}/zoho/list-leads`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      // console.log("leads list:",response.data.data);
      return response.data.data;
    },
  });

  
  // Sort leads by Created_Time descending (newest first)
  const sortedLeads = Array.isArray(leads)
  ? [...leads].sort((a, b) => {
      const dateA = new Date(a.Created_Time);
      const dateB = new Date(b.Created_Time);
      return dateB - dateA;
    })
  : [];

  // Then map
  const formattedLeads = sortedLeads.map((lead) => ({
    id: lead.id,
    shopName: lead.Company,
    createdTime: lead.Created_Time || 'N/A',
    createdBy: lead.Owner?.name || 'N/A',
    state: lead.State || 'N/A',
    LeadStatus: lead.Stage || 'N/A',
  }));

  //Filter based on search term
  const filteredLeads = formattedLeads.filter((lead) => {
    const term = searchTerm.toLowerCase();
    return (
      lead.shopName?.toLowerCase().includes(term) ||
      lead.createdBy?.toLowerCase().includes(term) ||
      lead.state?.toLowerCase().includes(term)
    );
  });

  //Paginate the filtered results
  const totalPages = Math.ceil(filteredLeads.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedLeads = filteredLeads.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handleRowClick = (leadId) => {
    setSelectedLeadId(leadId);
    setIsDrawerOpen(true);
  };
  return (
    <div className='min-h-screen bg-gray-900 text-white'>
      <main className='container mx-auto space-y-6 px-4 py-6'>
        <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} isDarkMode={isDarkMode} />
        {isLoading && (
          <div className='flex justify-center py-16'>
            <div className='mt-20 flex items-center justify-center'>
              <div className='text-center'>
                <div className='mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-b-2 border-orange-500'></div>
                <p className='text-xl text-gray-300'>Loading leads data...</p>
              </div>
            </div>
          </div>
        )}
        {!isLoading && !isError && (
          <>
            <div className='space-y-8'>
              <div className='rounded-lg bg-gray-800 p-4'>
                <LeadsTable
                  shops={paginatedLeads}
                  isDarkMode={isDarkMode}
                  onRowClick={handleRowClick}
                />
              </div>
            </div>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              isDarkMode={isDarkMode}
            />
            <LeadDrawer
              leadId={selectedLeadId}
              isOpen={isDrawerOpen}
              onClose={() => setIsDrawerOpen(false)}
            />
          </>
        )}
      </main>
    </div>
  );
};

export default Leads;
