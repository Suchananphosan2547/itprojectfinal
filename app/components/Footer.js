import React from 'react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full text-gray-600 py-6 border-t border-gray-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-center items-center text-center md:text-center space-y-4 md:space-y-0 md:space-x-8">

          {/* University Info */}
          <div className="w-full text-xs md:w-1/2">
            <p>มหาวิทยาลัยเกษตรศาสตร์ สำนักบริการการศึกษา สาขาเทคโนโลยีสารสนเทศ</p>
            <p className="text-xs text-gray-500 mt-1">
              Copyright &copy; {currentYear}. Faculty of Information Technology, Kasetsart University, Kamphaeng Saen Campus.
            </p>
          </div>

          {/* Team Info */}
          <div className="w-full md:w-1/2 order-1 md:order-2 mt-2 md:mt-0 text-center md:text-right text-xs">
            <p>คณะผู้จัดทำ</p>
            <p className="text-gray-500 mt-1 leading-tight">
              นายชัชภณ สุขโสมนัส, นางสาวกุลธิดา ทับทิมศรี, นางสาวสุชานันท์ โพธิ์ศาล
            </p>
          </div>

        </div>
      </div>
    </footer>
  );
};

export default Footer;
