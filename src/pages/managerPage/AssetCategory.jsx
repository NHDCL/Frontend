import React, { useState, useEffect } from "react";
import "./css/card.css";
import "./css/table.css";
import "./css/form.css";
import "./css/dropdown.css";
import { IoIosSearch } from "react-icons/io";
import { RiDeleteBin6Line } from "react-icons/ri";
import { FaEdit } from "react-icons/fa";
import { IoMdAdd } from "react-icons/io";
import { IoIosCloseCircle } from "react-icons/io";
import {
  useGetCategoryQuery,
  usePostCategoryMutation,
  useUpdateCategoryMutation,
  useSoftDeleteCategoryMutation,
} from "../../slices/assetApiSlice";
import Swal from "sweetalert2";

const Category = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [modalData, setModalData] = useState(null);
  const [editModalData, setEditModalData] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCategory, setNewCategory] = useState({
    name: "",
    depreciatedValue: "",
  });
  const { data: categories, error, isLoading, refetch } = useGetCategoryQuery();
  const [postCategory] = usePostCategoryMutation();
  const [updateCategory, { isLoading: isUpdating }] =
    useUpdateCategoryMutation();
  const [softDeleteCategory, { isLoading: isDeleting }] =
    useSoftDeleteCategoryMutation();

  const rowsPerPage = 10;

  // Filter out categories where deleted is false
  const filteredCategories = categories?.filter(
    (category) => category.deleted === false
  );

  // Sorting and filtering data
  const filteredData = [...(filteredCategories || [])]
    .sort((a, b) => b.AID - a.AID)
    .filter((item) =>
      Object.values(item).some((value) =>
        value.toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
    );

  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const displayedData = filteredData.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  useEffect(() => {
    if (isLoading) {
      Swal.fire({
        title: "Loading Asset Categories",
        text: "Please wait while we retrieve the data.",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });
    } else {
      Swal.close();
    }
  }, [isLoading]);

  const handleDeleteRow = async (id) => {
    const { value: confirmed } = await Swal.fire({
      title: "Are you sure?",
      text: "This will delete the category!",
      icon: "warning",
      color: "#305845",
      showCancelButton: true,
      confirmButtonColor: "#305845",
      cancelButtonColor: "#897462",
      confirmButtonText: "Yes, delete it!",
    });

    if (confirmed) {
      try {
        await softDeleteCategory(id).unwrap();
        Swal.fire({
          icon: "success",
          title: "Category deleted successfully!",
          toast: true,
          position: "top-end",
          showConfirmButton: false,
          timer: 2000,
        });

        refetch(); // Refresh the category list
        setModalData(null);
      } catch (err) {
        console.error(err);
        Swal.fire({
          icon: "error",
          title: "Failed to delete category.",
          toast: true,
          position: "top-end",
          showConfirmButton: false,
          timer: 2000,
        });
      }
    }
  };

  const handleEditRow = (item) => {
    setEditModalData({ ...item });
  };

  const handleAddCategory = () => {
    setShowAddModal(true);
    setNewCategory({ category: "", DepreciatedValue: "" });
  };

  const handleView = (item) => {
    setModalData(item);
  };

  const handleSaveNewCategory = async () => {
    if (newCategory.name && newCategory.depreciatedValue) {
      try {
        const { value: confirmed } = await Swal.fire({
          title: "Are you sure?",
          text: "You are about to add this new category!",
          icon: "warning",
          color: "#305845",
          showCancelButton: true,
          confirmButtonColor: "#305845",
          cancelButtonColor: "#897462",
          confirmButtonText: "Yes, add it!",
        });

        if (confirmed) {
          await postCategory(newCategory).unwrap();
          setShowAddModal(false);
          setNewCategory({ name: "", depreciatedValue: "" });
          refetch();
          Swal.fire({
            icon: "success",
            title: "Category added successfully!",
            toast: true,
            position: "top-end",
            showConfirmButton: false,
            timer: 2000,
          });
        }
      } catch (err) {
        Swal.fire({
          icon: "error",
          title: "Add Category Failed",
          text: "Unable to add the category at this time. Please try again later.",
        });
      }
    } else {
      Swal.fire({
        icon: "warning",
        title: "Incomplete Fields",
        text: "Please fill in all fields before saving.",
      });
    }
  };

  const handleUpdate = async () => {
    try {
      const { value: confirmed } = await Swal.fire({
        title: "Are you sure?",
        text: "You are about to update this category!",
        icon: "warning",
        color: "#305845",
        showCancelButton: true,
        confirmButtonColor: "#305845",
        cancelButtonColor: "#897462",
        confirmButtonText: "Yes, update it!",
      });

      if (confirmed) {
        await updateCategory({
          id: editModalData.id, // make sure `id` exists in `editModalData`
          updatedCategory: {
            name: editModalData.name,
            depreciatedValue: editModalData.depreciatedValue,
          },
        }).unwrap();

        Swal.fire({
          icon: "success",
          title: "Category updated successfully.",
          toast: true,
          position: "top-end",
          showConfirmButton: false,
          timer: 2000,
        });

        setEditModalData(null);
        refetch();
      }
    } catch (err) {
      console.log(err);
      Swal.fire({
        icon: "error",
        title: "Update Failed",
        text: "An error occurred while updating. Please try again later.",
      });
    }
  };

  return (
    <div className="ManagerDashboard">
      <div className="container">
        {/* Search and Create Button */}
        <div className="search-sort-container">
          <div className="search-container">
            <IoIosSearch style={{ width: "20px", height: "20px" }} />
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="create-category-btn">
            <IoMdAdd style={{ color: "#ffffff" }} />
            <button className="category-btn" onClick={handleAddCategory}>
              Create category
            </button>
          </div>
        </div>
        {/* Table */}
        <>
          {/* Table */}
          <div className="table-container">
            <table className="RequestTable">
              <thead className="table-header">
                <tr>
                  <th>SI.No</th>
                  <th>Category</th>
                  <th>Depreciated Value (%)</th>
                  <th>Edit</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {[...displayedData]
                  .sort((a, b) => (a.id < b.id ? 1 : -1)) // Sort by id DESC (latest first)
                  .map((item, index) => (
                    <tr key={item.id}>
                      <td>{(currentPage - 1) * rowsPerPage + index + 1}</td>
                      <td>{item.name}</td>
                      <td>{item.depreciatedValue}</td>
                      <td className="actions">
                        <button
                          className="edit-btn"
                          onClick={() => handleEditRow(item)}
                        >
                          <FaEdit style={{ width: "20px", height: "20px" }} />
                        </button>
                      </td>
                      <td className="actions">
                        <button
                          className="view-btn"
                          onClick={() => handleView(item)}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="pagination">
            <span>{filteredData.length} Results</span>
            <div>
              {[...Array(totalPages).keys()]
                .slice(0, totalPages < 5 ? totalPages : 5)
                .map((num) => (
                  <button
                    key={num}
                    className={currentPage === num + 1 ? "active" : ""}
                    onClick={() => setCurrentPage(num + 1)}
                  >
                    {num + 1}
                  </button>
                ))}
              {totalPages > 5 && (
                <>
                  <span>...</span>
                  <button onClick={() => setCurrentPage(totalPages)}>
                    {totalPages}
                  </button>
                </>
              )}
            </div>
          </div>
        </>
      </div>

      {modalData && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="form-h">Asset Category Details</h2>
              <button className="close-btn" onClick={() => setModalData(null)}>
                <IoIosCloseCircle
                  style={{ color: "#897463", width: "20px", height: "20px" }}
                />
              </button>
            </div>
            <div className="schedule-form">
              <div className="modal-content-field">
                <label>Category Name:</label>
                <input type="text" value={modalData.name} />
              </div>
              <div className="modal-content-field">
                <label>Depreciated Value (%):</label>
                <input type="number" value={modalData.depreciatedValue} />
              </div>
              <div className="modal-actions">
                <button
                  className="accept-btn"
                  style={{ width: "80px", backgroundColor: "#E72B2B" }}
                  onClick={() => handleDeleteRow(modalData.id)}
                  disabled={isDeleting}
                >
                  {isDeleting ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Category Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="form-h">Create Asset Category</h2>
              <button
                className="close-btn"
                onClick={() => setShowAddModal(false)}
              >
                <IoIosCloseCircle
                  style={{ color: "#897463", width: "20px", height: "20px" }}
                />
              </button>
            </div>
            <div className="schedule-form">
              <div className="modal-content-field">
                <label>Category Name:</label>
                <input
                  type="text"
                  value={newCategory.name}
                  onChange={(e) =>
                    setNewCategory({ ...newCategory, name: e.target.value })
                  }
                />
              </div>
              <div className="modal-content-field">
                <label>Depreciated Value (%):</label>
                <input
                  type="number"
                  value={newCategory.depreciatedValue}
                  onChange={(e) =>
                    setNewCategory({
                      ...newCategory,
                      depreciatedValue: e.target.value,
                    })
                  }
                />
              </div>
              <div className="modal-actions">
                <button
                  className="accept-btn"
                  style={{ width: "80px" }}
                  onClick={handleSaveNewCategory}
                  disabled={isLoading}
                >
                  {isLoading ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editModalData && (
        <div className="modal-overlay">
          <div className="modal-content">
            {/* Close Button */}
            <div className="modal-header">
              <h2 className="form-h">Edit Asset category</h2>
              <button
                className="close-btn"
                onClick={() => setEditModalData(null)}
              >
                <IoIosCloseCircle
                  style={{ color: "#897463", width: "20px", height: "20px" }}
                />
              </button>
            </div>
            <div className="schedule-form">
              <div className="modal-content-field">
                <label>Category:</label>
                <input
                  type="text"
                  value={editModalData.name}
                  onChange={(e) =>
                    setEditModalData({
                      ...editModalData,
                      name: e.target.value,
                    })
                  }
                />
              </div>

              <div className="modal-content-field">
                <label>Depreciated Value (%):</label>
                <input
                  type="number"
                  value={editModalData.depreciatedValue}
                  onChange={(e) =>
                    setEditModalData({
                      ...editModalData,
                      depreciatedValue: e.target.value,
                    })
                  }
                />
              </div>

              <div className="modal-actions">
                <button
                  onClick={handleUpdate}
                  disabled={isUpdating}
                  className="accept-btn"
                >
                  {isUpdating ? "Saving..." : "Update Category"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Category;
