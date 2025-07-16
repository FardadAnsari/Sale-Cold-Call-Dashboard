// src/pages/Leads.jsx
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import Pagination from '../components/Pagination';
import LeadsTable from '../components/LeadsTable'; // Assuming this is the shop table
import { API_BASE_URL } from '../api';
import Search from '../components/Search';

const ITEMS_PER_PAGE = 15;

const Leads = () => {
  const isDarkMode = true;
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const authToken = sessionStorage.getItem('authToken');

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
      console.log(response.data.data);
      return response.data.data;
    },
  });

  if (isLoading) return <p>Loading...</p>;
  if (isError) return <p>Error loading leads.</p>;

  //Format the full raw leads first
  const formattedLeads = leads.map((lead) => ({
    id: lead.id,
    shopName: lead.Company,
    createdTime: lead.Created_Time || 'N/A',
    createdBy: lead.Owner?.name || 'N/A',
    state: lead.State || 'N/A',
    LeadStatus: lead.Lead_Status || 'N/A',
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
    console.log('Clicked lead ID:', leadId);
  };

  return (
    <div className='min-h-screen bg-gray-900 text-white'>
      <main className='container mx-auto space-y-6 p-4'>
        <h1 className='mb-4 text-xl font-bold'>Leads</h1>
        <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} isDarkMode={isDarkMode} />
        <div className='space-y-8'>
          <div className='rounded-lg bg-gray-800 p-6'>
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
      </main>
    </div>
  );
};

export default Leads;
