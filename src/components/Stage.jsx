import SelectField from './SelectField'; // Ensure the path is correct
const Stage = () => {
  const stageOptions = [
    'Appointment With Manager',
    'Appointment With Staff',
    'Interested',
    'Not Interested',
    'Onboarded',
    'Junk Lead',
  ].sort(); // Sorting for consistent display

  return <SelectField label='Stage' name='Stage' options={stageOptions} />;
};

export default Stage;
